import prisma from "../config/prisma";
import { Prisma, Comment as PrismaComment } from "@prisma/client";

const _writerSelection = {
  select: {
    id: true,
    nickname: true,
    image: true,
  },
} as const;

type CommentWithWriter = Prisma.CommentGetPayload<{
  include: { writer: typeof _writerSelection };
}>;

interface CommentRepositoryPaginationOptions {
  skip?: string | number;
  take?: string | number;
}

async function create(
  data: Prisma.CommentCreateInput
): Promise<CommentWithWriter> {
  return prisma.comment.create({
    data,
    include: {
      writer: _writerSelection,
    },
  });
}

async function findByProductId(
  productId: number,
  options: CommentRepositoryPaginationOptions = {}
): Promise<CommentWithWriter[]> {
  const { skip: rawSkip, take: rawTake = 10 } = options;

  const skip =
    rawSkip !== undefined ? parseInt(String(rawSkip), 10) : undefined;
  const take = parseInt(String(rawTake), 10);

  return prisma.comment.findMany({
    where: { productId },
    include: {
      writer: _writerSelection,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take,
  });
}

async function findByArticleId(
  articleId: number,
  options: CommentRepositoryPaginationOptions = {}
): Promise<CommentWithWriter[]> {
  const { skip: rawSkip, take: rawTake = 10 } = options;

  const skip =
    rawSkip !== undefined ? parseInt(String(rawSkip), 10) : undefined;
  const take = parseInt(String(rawTake), 10);

  return prisma.comment.findMany({
    where: { articleId },
    include: {
      writer: _writerSelection,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take,
  });
}

async function findById(id: number): Promise<CommentWithWriter | null> {
  return prisma.comment.findUnique({
    where: { id },
    include: {
      writer: _writerSelection,
    },
  });
}

async function update(
  id: number,
  data: Prisma.CommentUpdateInput
): Promise<CommentWithWriter> {
  return prisma.comment.update({
    where: { id },
    data,
    include: {
      writer: _writerSelection,
    },
  });
}

async function deleteById(id: number): Promise<PrismaComment> {
  return prisma.comment.delete({
    where: { id },
  });
}

export default {
  create,
  findByProductId,
  findByArticleId,
  findById,
  update,
  deleteById,
};
