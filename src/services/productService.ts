import productRepository from "../repositories/productRepository";
import { CustomError } from "../utils/CustomError";
import { Prisma, Product } from "@prisma/client";

type ProductWithCoreInclusions = Prisma.ProductGetPayload<{
  include: {
    owner: { select: { id: true; nickname: true } };
    _count: { select: { likedBy: true } };
  };
}>;

type ProductWithOptionalLikes = ProductWithCoreInclusions & {
  likedBy?: Array<{ userId: number }>;
};

function formatProductResponse(
  product: ProductWithOptionalLikes | null,
  userId?: number
) {
  if (!product) return null;
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    images: product.images || [],
    tags: product.tags || [],
    ownerId: product.owner.id,
    ownerNickname: product.owner.nickname,
    favoriteCount: product._count?.likedBy || 0,
    createdAt: product.createdAt,
    isFavorite:
      userId && Array.isArray(product.likedBy)
        ? product.likedBy.some(
            (like: { userId: number }) => like.userId === userId
          )
        : false,
  };
}

async function getProductById(productId: string, userId?: number) {
  const product = await productRepository.findById(productId, userId);
  if (!product) {
    throw new CustomError(404, "상품을 찾을 수 없습니다.");
  }
  return formatProductResponse(product, userId);
}

interface CreateProductData {
  name: string;
  price: number | string;
  description: string;
  tags?: string[];
  images?: string[];
}

async function createProduct(productData: CreateProductData, ownerId: number) {
  if (!productData.name || productData.price === undefined) {
    throw new CustomError(422, "상품 이름과 가격은 필수입니다.");
  }
  if (
    (typeof productData.price !== "number" &&
      typeof productData.price !== "string") ||
    (typeof productData.price === "string" &&
      isNaN(parseInt(productData.price, 10))) ||
    (typeof productData.price === "number" && isNaN(productData.price)) ||
    Number(productData.price) < 0
  ) {
    throw new CustomError(422, "가격은 0 이상의 숫자여야 합니다.");
  }
  if (productData.tags && !Array.isArray(productData.tags)) {
    throw new CustomError(422, "태그는 배열이어야 합니다.");
  }
  if (productData.images && !Array.isArray(productData.images)) {
    throw new CustomError(422, "이미지는 URL 배열이어야 합니다.");
  }

  const createdProduct = await productRepository.create(
    {
      name: productData.name,
      price: productData.price,
      description: productData.description,
      tags: productData.tags,
      images: productData.images,
    },
    ownerId
  );
  return formatProductResponse(createdProduct, ownerId);
}

interface GetProductsQueryParams {
  page?: string | number;
  pageSize?: string | number;
  orderBy?: "recent" | "favorite";
  keyword?: string;
  [key: string]: any;
}

async function getProducts(
  queryParams: GetProductsQueryParams,
  userId?: number
) {
  const { page = 1, pageSize = 10, orderBy = "recent", keyword } = queryParams;

  const skip =
    (parseInt(String(page), 10) - 1) * parseInt(String(pageSize), 10);
  const take = parseInt(String(pageSize), 10);

  const where: Prisma.ProductWhereInput = {};
  if (keyword) {
    where.OR = [
      { name: { contains: keyword, mode: "insensitive" } },
      { description: { contains: keyword, mode: "insensitive" } },
      { tags: { has: keyword } },
    ];
  }

  let prismaOrderBy:
    | Prisma.ProductOrderByWithRelationInput
    | Prisma.ProductOrderByWithRelationInput[] = {};
  if (orderBy === "favorite") {
    prismaOrderBy = { likedBy: { _count: "desc" } };
  } else {
    prismaOrderBy = { createdAt: "desc" };
  }

  const { list, totalCount } = await productRepository.findAll(
    { skip, take, where, orderBy: prismaOrderBy },
    userId
  );

  return {
    totalCount,
    list: list.map((product) => formatProductResponse(product, userId)),
  };
}

interface UpdateProductData {
  name?: string;
  price?: string | number;
  description?: string;
  tags?: string[];
  images?: string[];
}

async function updateProduct(
  productId: string,
  updateData: UpdateProductData,
  requesterId: number
) {
  const productToUpdate = await productRepository.findById(
    productId,
    requesterId
  );
  if (!productToUpdate) {
    throw new CustomError(404, "수정할 상품을 찾을 수 없습니다.");
  }

  if (productToUpdate.owner.id !== requesterId) {
    throw new CustomError(403, "상품을 수정할 권한이 없습니다.");
  }

  if (Object.keys(updateData).length === 0) {
    throw new CustomError(400, "수정할 내용이 없습니다.");
  }
  if (
    updateData.price !== undefined &&
    ((typeof updateData.price !== "number" &&
      typeof updateData.price !== "string") ||
      (typeof updateData.price === "string" &&
        isNaN(parseInt(updateData.price, 10))) ||
      (typeof updateData.price === "number" && isNaN(updateData.price)) ||
      Number(updateData.price) < 0)
  ) {
    throw new CustomError(422, "가격은 0 이상의 숫자여야 합니다.");
  }
  if (updateData.tags && !Array.isArray(updateData.tags)) {
    throw new CustomError(422, "태그는 배열이어야 합니다.");
  }
  if (updateData.images && !Array.isArray(updateData.images)) {
    throw new CustomError(422, "이미지는 URL 배열이어야 합니다.");
  }

  const updatedProductRaw = await productRepository.update(
    productId,
    updateData
  );
  const finalProduct = await productRepository.findById(productId, requesterId);
  return formatProductResponse(finalProduct, requesterId);
}

async function deleteProduct(productId: string, requesterId: number) {
  const product = await productRepository.findById(productId);
  if (!product) {
    throw new CustomError(404, "삭제할 상품을 찾을 수 없습니다.");
  }

  if (product.owner.id !== requesterId) {
    throw new CustomError(403, "상품을 삭제할 권한이 없습니다.");
  }

  await productRepository.deleteById(productId);
  return { id: parseInt(productId, 10) };
}

async function addFavorite(productId: string, userId: number) {
  const product = await productRepository.findById(productId, userId);
  if (!product) {
    throw new CustomError(404, "즐겨찾기할 상품을 찾을 수 없습니다.");
  }

  const existingLike = await productRepository.findLike(productId, userId);
  if (existingLike) {
    return formatProductResponse(product, userId);
  }

  await productRepository.createLike(productId, userId);
  const updatedProduct = await productRepository.findById(productId, userId);
  return formatProductResponse(updatedProduct, userId);
}

async function removeFavorite(productId: string, userId: number) {
  const product = await productRepository.findById(productId, userId);
  if (!product) {
    throw new CustomError(404, "즐겨찾기에서 삭제할 상품을 찾을 수 없습니다.");
  }

  const existingLike = await productRepository.findLike(productId, userId);
  if (!existingLike) {
    return formatProductResponse(product, userId);
  }

  await productRepository.deleteLike(productId, userId);
  const updatedProduct = await productRepository.findById(productId, userId);
  return formatProductResponse(updatedProduct, userId);
}

export default {
  getProductById,
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  addFavorite,
  removeFavorite,
};
