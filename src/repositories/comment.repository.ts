import { Comment, Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";

export class CommentRepository {
  async create(data: Prisma.CommentCreateInput): Promise<Comment> {
    return prisma.comment.create({
      data,
      include: {
        user: { select: { id: true, nickname: true } },
      },
    });
  }

  async findById(id: number): Promise<Comment | null> {
    return prisma.comment.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: Prisma.CommentUpdateInput): Promise<Comment> {
    return prisma.comment.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Comment> {
    return prisma.comment.delete({
      where: { id },
    });
  }

  async findProductComments(
    productId: number,
    limit: number,
    cursor?: number
  ): Promise<Comment[]> {
    const query: Prisma.CommentFindManyArgs = {
      where: { productId },
      include: {
        user: { select: { id: true, nickname: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    };

    if (cursor) {
      query.cursor = { id: cursor };
      query.skip = 1;
    }

    return prisma.comment.findMany(query);
  }
}
