import prisma from "../config/prisma";
import { Prisma, Product, ProductLike } from "@prisma/client";

// Helper for consistent selections
const _productOwnerSelection = {
  select: { id: true, nickname: true },
} as const;
const _productCountSelection = { select: { likedBy: true } } as const;

interface ProductFindAllOptions {
  skip?: string | number;
  take?: string | number;
  where?: Prisma.ProductWhereInput;
  orderBy?:
    | Prisma.ProductOrderByWithRelationInput
    | Prisma.ProductOrderByWithRelationInput[];
}

interface ProductCreateInputArgs {
  name: string;
  description: string; // Changed from: string | null | undefined
  price: number | string;
  images?: string[];
  tags?: string[];
}

interface ProductUpdateDataArgs {
  name?: string;
  description?: string; // Changed from: string | null | undefined
  price?: string | number;
  images?: Prisma.ProductUpdateimagesInput | string[];
  tags?: Prisma.ProductUpdatetagsInput | string[];
  [key: string]: any;
}

// Type for objects with core relations included (owner, _count)
// Used for create and update results
type ProductWithCoreInclusions = Prisma.ProductGetPayload<{
  include: {
    owner: typeof _productOwnerSelection;
    _count: typeof _productCountSelection;
  };
}>;

// Type for objects that might also include conditional 'likedBy' info
// Used for findById and findAll results
type ProductWithOptionalLikes = ProductWithCoreInclusions & {
  likedBy?: { userId: number }[];
};

async function findById(
  id: string,
  userId?: number
): Promise<ProductWithOptionalLikes | null> {
  const product = await prisma.product.findUnique({
    where: {
      id: parseInt(id, 10),
    },
    include: {
      owner: _productOwnerSelection,
      likedBy: userId
        ? {
            where: { userId },
            select: { userId: true },
          }
        : false,
      _count: _productCountSelection,
    },
  });
  // Prisma's return type with conditional includes can be tricky.
  // If likedBy is false, the property won't exist.
  // Casting might be necessary if GetPayload cannot fully represent this.
  return product as ProductWithOptionalLikes | null;
}

async function create(
  productData: ProductCreateInputArgs,
  ownerId: number
): Promise<ProductWithCoreInclusions> {
  const { name, description, price, images, tags } = productData;
  return prisma.product.create({
    data: {
      name,
      description, // Now 'string', matching non-nullable schema expectation
      price: typeof price === "string" ? parseInt(price, 10) : price,
      images: images || [],
      owner: {
        connect: { id: ownerId },
      },
      tags: tags || [],
    },
    include: {
      owner: _productOwnerSelection,
      _count: _productCountSelection,
    },
  });
}

async function findAll(
  options: ProductFindAllOptions = {},
  userId?: number
): Promise<{ list: ProductWithOptionalLikes[]; totalCount: number }> {
  const { skip, take = 10, where, orderBy = { createdAt: "desc" } } = options;

  const products = await prisma.product.findMany({
    where,
    include: {
      owner: _productOwnerSelection,
      likedBy: userId ? { where: { userId }, select: { userId: true } } : false,
      _count: _productCountSelection,
    },
    orderBy,
    skip: skip !== undefined ? parseInt(String(skip), 10) : 0,
    take: parseInt(String(take), 10),
  });

  const totalCount = await prisma.product.count({ where });

  return { list: products as ProductWithOptionalLikes[], totalCount };
}

async function update(
  id: string,
  data: ProductUpdateDataArgs
): Promise<ProductWithCoreInclusions> {
  const { name, description, price, images, tags, ...otherData } = data;
  const finalUpdatePayload: Prisma.ProductUpdateInput = { ...otherData };

  if (name !== undefined) finalUpdatePayload.name = name;
  // description is now 'string | undefined'. If undefined, it's skipped.
  // If string, it's assigned. This is compatible with a non-nullable schema field.
  if (description !== undefined) finalUpdatePayload.description = description;
  if (price !== undefined && price !== null) {
    // price can be 0
    finalUpdatePayload.price =
      typeof price === "string" ? parseInt(price, 10) : price;
  }
  if (images !== undefined) finalUpdatePayload.images = images;
  if (tags !== undefined) finalUpdatePayload.tags = tags;

  return prisma.product.update({
    where: { id: parseInt(id, 10) },
    data: finalUpdatePayload,
    include: {
      owner: _productOwnerSelection,
      _count: _productCountSelection,
    },
  });
}

async function deleteById(id: string): Promise<Product> {
  return prisma.product.delete({
    where: { id: parseInt(id, 10) },
  });
}

async function findLike(
  productId: string,
  userId: number
): Promise<ProductLike | null> {
  return prisma.productLike.findUnique({
    where: { userId_productId: { userId, productId: parseInt(productId, 10) } },
  });
}

async function createLike(
  productId: string,
  userId: number
): Promise<ProductLike> {
  return prisma.productLike.create({
    data: { userId, productId: parseInt(productId, 10) },
  });
}

async function deleteLike(
  productId: string,
  userId: number
): Promise<ProductLike> {
  return prisma.productLike.delete({
    where: { userId_productId: { userId, productId: parseInt(productId, 10) } },
  });
}

export default {
  findById,
  create,
  findAll,
  update,
  deleteById,
  findLike,
  createLike,
  deleteLike,
};
