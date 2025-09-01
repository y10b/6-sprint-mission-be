import { Like } from "@prisma/client";
import { prisma } from "../db/prisma";
import { NotFoundError } from "../utils/customError";

export class FavoriteService {
  async toggleArticleFavorite(
    articleId: number,
    userId: number
  ): Promise<{ liked: boolean }> {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundError("게시글을 찾을 수 없습니다.");
    }

    const existingFavorite = await prisma.like.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    if (existingFavorite) {
      await prisma.like.delete({
        where: {
          userId_articleId: {
            userId,
            articleId,
          },
        },
      });
      return { liked: false };
    } else {
      await prisma.like.create({
        data: {
          userId,
          articleId,
        },
      });
      return { liked: true };
    }
  }

  async toggleProductFavorite(
    productId: number,
    userId: number
  ): Promise<{ liked: boolean; favoriteCount: number }> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError("상품을 찾을 수 없습니다.");
    }

    const existingFavorite = await prisma.like.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingFavorite) {
      await prisma.like.delete({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      const favoriteCount = await prisma.like.count({
        where: { productId },
      });

      return { liked: false, favoriteCount };
    } else {
      await prisma.like.create({
        data: {
          userId,
          productId,
        },
      });

      const favoriteCount = await prisma.like.count({
        where: { productId },
      });

      return { liked: true, favoriteCount };
    }
  }

  async removeArticleFavorite(
    articleId: number,
    userId: number
  ): Promise<void> {
    const favorite = await prisma.like.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundError("좋아요를 찾을 수 없습니다.");
    }

    await prisma.like.delete({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });
  }

  async removeProductFavorite(
    productId: number,
    userId: number
  ): Promise<{ favoriteCount: number }> {
    const favorite = await prisma.like.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundError("좋아요를 찾을 수 없습니다.");
    }

    await prisma.like.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    // 삭제 후 남은 좋아요 수 계산
    const favoriteCount = await prisma.like.count({
      where: {
        productId,
      },
    });

    return { favoriteCount };
  }
}
