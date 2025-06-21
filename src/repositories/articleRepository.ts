import prisma from "../config/prisma";
import { Prisma, Article, ArticleLike } from "@prisma/client";

const _writerSelection = {
  select: {
    id: true,
    nickname: true,
    image: true,
  },
} as const;

const _countSelection = {
  select: { likedBy: true, comments: true },
} as const;

interface ArticleFindAllOptions {
  skip?: string | number;
  take?: string | number;
  where?: Prisma.ArticleWhereInput;
  orderBy?:
    | Prisma.ArticleOrderByWithRelationInput
    | Prisma.ArticleOrderByWithRelationInput[];
}

async function create(data: Prisma.ArticleCreateInput): Promise<
  Prisma.ArticleGetPayload<{
    include: {
      writer: typeof _writerSelection;
      _count: typeof _countSelection;
    };
  }>
> {
  return prisma.article.create({
    data,
    include: {
      writer: _writerSelection,
      _count: _countSelection,
    },
  });
}

async function findAll(
  options: ArticleFindAllOptions = {},
  userId?: number
): Promise<{
  list: Prisma.ArticleGetPayload<{
    include: {
      writer: typeof _writerSelection;
      _count: typeof _countSelection;
    };
  }>[];
  totalCount: number;
}> {
  const { skip, take = 10, where, orderBy = { createdAt: "desc" } } = options;

  const articles = await prisma.article.findMany({
    where,
    include: {
      writer: _writerSelection,
      _count: _countSelection,
    },
    orderBy,
    skip: skip !== undefined ? parseInt(String(skip), 10) : 0,
    take: take !== undefined ? parseInt(String(take), 10) : 10,
  });

  const totalCount = await prisma.article.count({ where });

  const listWithIsLiked = articles.map((article) => {
    const likedByArray = (article as any).likedBy;
    const isLiked =
      userId && Array.isArray(likedByArray)
        ? likedByArray.some(
            (like: { userId: number }) => like.userId === userId
          )
        : false;
    return { ...article, isLiked };
  });

  return { list: listWithIsLiked, totalCount };
}

async function findById(
  id: number,
  userId?: number
): Promise<Prisma.ArticleGetPayload<{
  include: {
    writer: typeof _writerSelection;
    comments: {
      orderBy: { createdAt: "desc" };
      take: 5;
      include: { writer: typeof _writerSelection };
    };
    likedBy: { select: { userId: true } } | false;
    _count: typeof _countSelection;
  };
}> | null> {
  return prisma.article.findUnique({
    where: { id },
    include: {
      writer: _writerSelection,
      comments: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          writer: _writerSelection,
        },
      },
      likedBy: userId
        ? {
            where: { userId },
            select: { userId: true },
          }
        : false,
      _count: _countSelection,
    },
  });
}

async function update(
  id: number,
  data: Prisma.ArticleUpdateInput
): Promise<
  Prisma.ArticleGetPayload<{
    include: {
      writer: typeof _writerSelection;
      _count: typeof _countSelection;
    };
  }>
> {
  return prisma.article.update({
    where: { id },
    data,
    include: {
      writer: _writerSelection,
      _count: _countSelection,
    },
  });
}

async function deleteById(id: number): Promise<Article> {
  return prisma.article.delete({
    where: { id },
  });
}

async function findLike(
  articleId: number,
  userId: number
): Promise<ArticleLike | null> {
  return prisma.articleLike.findUnique({
    where: {
      userId_articleId: {
        userId,
        articleId,
      },
    },
  });
}

async function createLike(
  articleId: number,
  userId: number
): Promise<ArticleLike> {
  return prisma.articleLike.create({
    data: {
      articleId,
      userId,
    },
  });
}

async function deleteLike(
  articleId: number,
  userId: number
): Promise<ArticleLike> {
  return prisma.articleLike.delete({
    where: {
      userId_articleId: {
        userId,
        articleId,
      },
    },
  });
}

export default {
  create,
  findAll,
  findById,
  update,
  deleteById,
  findLike,
  createLike,
  deleteLike,
};
