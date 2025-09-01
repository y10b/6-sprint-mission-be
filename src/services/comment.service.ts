import { Comment } from "@prisma/client";
import { prisma } from "../db/prisma";
import { NotFoundError, ForbiddenError } from "../utils/customError";

export class CommentService {
  async createArticleComment(
    articleId: number,
    userId: number,
    content: string
  ): Promise<Comment> {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundError("게시글을 찾을 수 없습니다.");
    }

    return prisma.comment.create({
      data: {
        content,
        articleId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });
  }

  async createProductComment(
    productId: number,
    userId: number,
    content: string
  ): Promise<Comment> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError("상품을 찾을 수 없습니다.");
    }

    return prisma.comment.create({
      data: {
        content,
        productId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });
  }

  async updateComment(
    commentId: number,
    userId: number,
    content: string
  ): Promise<Comment> {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundError("댓글을 찾을 수 없습니다.");
    }

    if (comment.userId !== userId) {
      throw new ForbiddenError("자신의 댓글만 수정할 수 있습니다.");
    }

    return prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });
  }

  async deleteComment(commentId: number, userId: number): Promise<void> {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundError("댓글을 찾을 수 없습니다.");
    }

    if (comment.userId !== userId) {
      throw new ForbiddenError("자신의 댓글만 삭제할 수 있습니다.");
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });
  }

  async getCommentsForProduct(productId: number): Promise<Comment[]> {
    return prisma.comment.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getCommentsForArticle(articleId: number): Promise<Comment[]> {
    return prisma.comment.findMany({
      where: { articleId },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
