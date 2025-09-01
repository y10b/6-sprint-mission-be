import { Product, Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";

interface CreateProductData {
  name: string;
  description: string;
  price: number;
  tags: string[];
  imageUrls: string[];
}

interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  tags?: string[];
  imageUrls?: string[];
}

export class ProductRepository {
  async findAll(
    skip: number,
    take: number,
    keyword: string,
    orderBy: Prisma.ProductOrderByWithRelationInput
  ) {
    const where = keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
            {
              description: {
                contains: keyword,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {};

    return Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          _count: {
            select: { likes: true },
          },
          likes: false,
          images: true,
        },
      }),
    ]);
  }

  async findById(id: number) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        comments: true,
        _count: {
          select: { likes: true },
        },
        seller: {
          select: { nickname: true },
        },
        images: true,
      },
    });
  }

  async create(data: CreateProductData, userId: number) {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        tags: data.tags,
        seller: { connect: { id: userId } },
        images: {
          create: data.imageUrls.map((url: string) => ({ url })),
        },
      },
    });
  }

  async update(id: number, data: UpdateProductData) {
    const { imageUrls, ...productData } = data;

    // 트랜잭션으로 처리
    return prisma.$transaction(async (prisma) => {
      // 기존 이미지 삭제
      if (imageUrls) {
        await prisma.product.update({
          where: { id },
          data: {
            images: {
              deleteMany: {},
            },
          },
        });

        // 새 이미지 추가
        if (imageUrls.length > 0) {
          await prisma.product.update({
            where: { id },
            data: {
              images: {
                create: imageUrls.map((url) => ({ url })),
              },
            },
          });
        }
      }

      // 상품 정보 업데이트
      return prisma.product.update({
        where: { id },
        data: productData,
        include: {
          images: true,
          _count: {
            select: { likes: true },
          },
          seller: {
            select: { nickname: true },
          },
        },
      });
    });
  }

  async delete(id: number) {
    // 트랜잭션으로 관련 데이터 모두 삭제
    return prisma.$transaction([
      prisma.comment.deleteMany({ where: { productId: id } }),
      prisma.like.deleteMany({ where: { productId: id } }),
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);
  }

  async checkLikeStatus(productId: number, userId: number) {
    return prisma.like.findFirst({
      where: {
        productId,
        userId,
      },
    });
  }
}
