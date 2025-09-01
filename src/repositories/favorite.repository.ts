import { Like, Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";

export class FavoriteRepository {
  async findProductFavorite(
    userId: number,
    productId: number
  ): Promise<Like | null> {
    return prisma.like.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  async findArticleFavorite(
    userId: number,
    articleId: number
  ): Promise<Like | null> {
    return prisma.like.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });
  }

  async create(data: Prisma.LikeCreateInput): Promise<Like> {
    return prisma.like.create({
      data,
    });
  }

  async delete(id: number): Promise<Like> {
    return prisma.like.delete({
      where: { id },
    });
  }

  async countProductFavorites(productId: number): Promise<number> {
    return prisma.like.count({
      where: { productId },
    });
  }

  async countArticleFavorites(articleId: number): Promise<number> {
    return prisma.like.count({
      where: { articleId },
    });
  }

  async transaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    return prisma.$transaction(callback);
  }
}
