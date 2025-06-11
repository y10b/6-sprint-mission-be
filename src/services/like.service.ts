import { PrismaClient, Like } from "@prisma/client";
import { NotFoundError } from "../utils/customError";

export class LikeService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async toggleArticleLike(
    articleId: number,
    userId: number
  ): Promise<{ liked: boolean }> {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundError("게시글을 찾을 수 없습니다.");
    }

    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    if (existingLike) {
      await this.prisma.like.delete({
        where: {
          userId_articleId: {
            userId,
            articleId,
          },
        },
      });
      return { liked: false };
    } else {
      await this.prisma.like.create({
        data: {
          userId,
          articleId,
        },
      });
      return { liked: true };
    }
  }

  async toggleProductLike(
    productId: number,
    userId: number
  ): Promise<{ liked: boolean }> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError("상품을 찾을 수 없습니다.");
    }

    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingLike) {
      await this.prisma.like.delete({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });
      return { liked: false };
    } else {
      await this.prisma.like.create({
        data: {
          userId,
          productId,
        },
      });
      return { liked: true };
    }
  }

  async removeArticleLike(articleId: number, userId: number): Promise<void> {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    if (!like) {
      throw new NotFoundError("좋아요를 찾을 수 없습니다.");
    }

    await this.prisma.like.delete({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });
  }

  async removeProductLike(productId: number, userId: number): Promise<void> {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!like) {
      throw new NotFoundError("좋아요를 찾을 수 없습니다.");
    }

    await this.prisma.like.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }
}
