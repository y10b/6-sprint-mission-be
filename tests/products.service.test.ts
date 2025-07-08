import { ProductService } from "../src/services/product.service";

// 목 레포지토리 타입 정의 (테스트 전용)
// jest.Mock 타입 사용으로 DB 없이 서비스 로직만 테스트
interface MockProductRepository {
  findAll: jest.Mock;
  findById: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  checkLikeStatus: jest.Mock;
}

describe("ProductService – CRUD", () => {
  // product.service.ts 파일 테스트
  let service: ProductService;
  let repo: MockProductRepository;

  beforeEach(() => {
    service = new ProductService();

    // 레포지토리 메서드들을 jest.fn()으로 대체
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      checkLikeStatus: jest.fn(),
    } as unknown as MockProductRepository;

    // (private) productRepository에 목 주입
    (service as any).productRepository = repo;
  });

  describe("createProduct", () => {
    it("정상적으로 상품을 생성한다", async () => {
      const dto = {
        name: "테스트 상품",
        description: "설명",
        price: 1000,
        tags: ["tag1"],
        imageUrls: ["img1.jpg"],
      };

      const expected = { id: 1, ...dto, sellerId: 10 };
      repo.create.mockResolvedValue(expected);

      const result = await service.createProduct(dto, 10);

      expect(repo.create).toHaveBeenCalledWith(dto, 10);
      expect(result).toEqual(expected);
    });

    it("필수 값이 없으면 상품 생성에 실패한다", async () => {
      const invalidDto = {
        // name이 빠졌다고 가정
        description: "설명",
        price: 1000,
        tags: ["tag1"],
        imageUrls: ["img1.jpg"],
      };

      await expect(
        service.createProduct(invalidDto as any, 10)
      ).rejects.toThrow("상품명은 필수입니다.");

      expect(repo.create).not.toHaveBeenCalled();
    });

    it("가격이 0원 이하면 상품 생성에 실패한다", async () => {
      const invalidDto = {
        name: "테스트 상품",
        description: "설명",
        price: 0,
        tags: ["tag1"],
        imageUrls: ["img1.jpg"],
      };

      await expect(
        service.createProduct(invalidDto as any, 10)
      ).rejects.toThrow("가격은 0원 이상이어야 합니다.");

      expect(repo.create).not.toHaveBeenCalled();
    });

    it("이미지가 업로드되지 않으면 상품 생성에 실패한다", async () => {
      const invalidDto = {
        name: "테스트 상품",
        description: "설명",
        price: 1000,
        tags: ["tag1"],
        imageUrls: [],
      };

      await expect(
        service.createProduct(invalidDto as any, 10)
      ).rejects.toThrow("이미지가 업로드되지 않았습니다.");

      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe("updateProduct", () => {
    it("판매자 본인이면 상품을 수정할 수 있다", async () => {
      const origin = { id: 1, sellerId: 10 };
      repo.findById.mockResolvedValue(origin);
      const updated = { ...origin, name: "수정된 이름" };
      repo.update.mockResolvedValue(updated);

      const result = await service.updateProduct(
        1,
        { name: "수정된 이름" },
        10
      );

      expect(repo.update).toHaveBeenCalledWith(1, { name: "수정된 이름" });
      expect(result).toEqual(updated);
    });

    it("다른 사용자가 수정하려 하면 오류를 던진다", async () => {
      repo.findById.mockResolvedValue({ id: 1, sellerId: 20 });

      await expect(
        service.updateProduct(1, { name: "해킹" }, 10)
      ).rejects.toThrow("You do not have permission");
    });
  });

  describe("deleteProduct", () => {
    it("판매자 본인이면 상품을 삭제할 수 있다", async () => {
      repo.findById.mockResolvedValue({ id: 1, sellerId: 10 });
      repo.delete.mockResolvedValue(undefined);

      await service.deleteProduct(1, 10);

      expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it("다른 사용자가 삭제하려 하면 오류를 던진다", async () => {
      repo.findById.mockResolvedValue({ id: 1, sellerId: 20 });

      await expect(service.deleteProduct(1, 10)).rejects.toThrow(
        "You do not have permission"
      );
    });
  });

  describe("getAllProducts", () => {
    it("상품 목록을 페이지네이션과 함께 반환한다", async () => {
      const prismaSampleProduct = {
        id: 1,
        name: "상품",
        description: "설명",
        price: 1000,
        tags: [],
        sellerId: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { likes: 2 },
        seller: { nickname: "판매자" },
        images: [{ url: "img1.jpg" }],
      };

      repo.findAll.mockResolvedValue([1, [prismaSampleProduct]]);

      const result = await service.getAllProducts(
        1,
        10,
        "latest",
        "",
        undefined
      );

      expect(repo.findAll).toHaveBeenCalled();
      expect(result.totalCount).toBe(1);
      expect(result.list[0].favoriteCount).toBe(2);
      expect(result.list[0].images).toEqual(["img1.jpg"]);
    });

    it("로그인 사용자의 좋아요 상태를 반영한다", async () => {
      const prod = {
        id: 2,
        name: "상품2",
        description: "desc",
        price: 2000,
        tags: [],
        sellerId: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { likes: 5 },
        seller: { nickname: "판매자" },
        images: [{ url: "url2" }],
      };

      repo.findAll.mockResolvedValue([1, [prod]]);
      // checkLikeStatus 반환값으로 truthy
      repo.checkLikeStatus.mockResolvedValue({});

      const result = await service.getAllProducts(1, 10, "likes", "", 1);

      expect(repo.checkLikeStatus).toHaveBeenCalledWith(2, 1);
      expect(result.list[0].isLiked).toBe(true);
    });
  });

  describe("getProductById", () => {
    it("상품이 없으면 null을 반환한다", async () => {
      repo.findById.mockResolvedValue(null);

      const result = await service.getProductById(999);

      expect(result).toBeNull();
    });

    it("로그인 사용자에게 isLiked 여부를 포함한다", async () => {
      const prod = {
        id: 3,
        name: "P",
        description: "D",
        price: 100,
        tags: [],
        sellerId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { likes: 1 },
        seller: { nickname: "nick" },
        images: [{ url: "img" }],
      };
      repo.findById.mockResolvedValue(prod);
      repo.checkLikeStatus.mockResolvedValue({});

      const result = await service.getProductById(3, 1);

      expect(repo.checkLikeStatus).toHaveBeenCalledWith(3, 1);
      expect(result?.isLiked).toBe(true);
    });
  });

  describe("updateProduct & deleteProduct 오류", () => {
    it("없는 상품 수정 시 오류", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.updateProduct(1, {}, 1)).rejects.toThrow(
        "Product not found"
      );
    });

    it("없는 상품 삭제 시 오류", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.deleteProduct(1, 1)).rejects.toThrow(
        "Product not found"
      );
    });
  });
});
