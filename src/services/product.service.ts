import { ProductRepository } from "../repositories/product.repository";
import { Prisma } from "@prisma/client";
import {
  TCreateProductDto,
  IProductWithDetails,
  TUpdateProductDto,
} from "../types/product.types";

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  async getAllProducts(
    page: number,
    limit: number,
    sort: string,
    keyword: string,
    userId?: number
  ) {
    const skip = (page - 1) * limit;

    let orderBy: Prisma.ProductOrderByWithRelationInput;
    if (sort === "likes") {
      orderBy = { likes: { _count: "desc" } };
    } else {
      orderBy = { createdAt: "desc" };
    }

    const [totalCount, products] = await this.productRepository.findAll(
      skip,
      limit,
      keyword,
      orderBy
    );

    const formattedProducts = products.map((product) => ({
      ...product,
      favoriteCount: product._count.likes,
      isLiked: false,
      images: product.images.map((image) => image.url),
    }));

    if (userId) {
      // 로그인한 사용자의 좋아요 상태 확인
      await Promise.all(
        formattedProducts.map(async (product) => {
          const like = await this.productRepository.checkLikeStatus(
            product.id,
            userId
          );
          product.isLiked = !!like;
        })
      );
    }

    return {
      list: formattedProducts,
      totalCount,
    };
  }

  async getProductById(
    id: number,
    userId?: number
  ): Promise<IProductWithDetails | null> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      return null;
    }

    const isLiked = userId
      ? !!(await this.productRepository.checkLikeStatus(id, userId))
      : false;

    const { _count, seller, images, ...rest } = product;

    return {
      ...rest,
      favoriteCount: _count.likes,
      sellerNickname: seller.nickname,
      isLiked,
      images: images.map((image) => image.url),
    };
  }

  async createProduct(data: TCreateProductDto, userId: number) {
    if (!data.name || data.name.trim() === "") {
      throw new Error("상품명은 필수입니다.");
    }

    if (data.price <= 0) {
      throw new Error("가격은 0원 이상이어야 합니다.");
    }

    if (!data.imageUrls || data.imageUrls.length === 0) {
      throw new Error("이미지가 업로드되지 않았습니다.");
    }

    return this.productRepository.create(data, userId);
  }

  async updateProduct(id: number, data: TUpdateProductDto, userId: number) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.sellerId !== userId) {
      throw new Error("You do not have permission to update this product");
    }

    return this.productRepository.update(id, data);
  }

  async deleteProduct(id: number, userId: number) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.sellerId !== userId) {
      throw new Error("You do not have permission to delete this product");
    }

    await this.productRepository.delete(id);
  }
}
