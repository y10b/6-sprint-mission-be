import { PrismaClient, Like, Prisma } from "@prisma/client";

export class LikeRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findProductLike(
    userId: number,
    productId: number
  ): Promise<Like | null> {
    return this.prisma.like.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  async findArticleLike(
    userId: number,
    articleId: number
  ): Promise<Like | null> {
    return this.prisma.like.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });
  }

  async create(data: Prisma.LikeCreateInput): Promise<Like> {
    return this.prisma.like.create({
      data,
    });
  }

  async delete(id: number): Promise<Like> {
    return this.prisma.like.delete({
      where: { id },
    });
  }

  async countProductLikes(productId: number): Promise<number> {
    return this.prisma.like.count({
      where: { productId },
    });
  }

  async countArticleLikes(articleId: number): Promise<number> {
    return this.prisma.like.count({
      where: { articleId },
    });
  }

  async transaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}
