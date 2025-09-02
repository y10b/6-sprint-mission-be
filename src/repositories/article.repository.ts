import { Article, Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { TCreateArticleDto, TUpdateArticleDto } from "../types/article.types";

interface IArticleWithAuthor extends Article {
  author: {
    id: number;
    nickname: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

export class ArticleRepository {
  async findAll(
    skip: number,
    take: number,
    keyword: string,
    orderBy: Prisma.ArticleOrderByWithRelationInput
  ): Promise<[number, IArticleWithAuthor[]]> {
    const where = keyword
      ? {
          OR: [
            {
              title: { contains: keyword, mode: Prisma.QueryMode.insensitive },
            },
            {
              content: {
                contains: keyword,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {};

    return Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          _count: {
            select: { likes: true },
          },
          author: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      }) as Promise<IArticleWithAuthor[]>,
    ]);
  }

  async findById(id: number): Promise<IArticleWithAuthor | null> {
    return prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    }) as Promise<IArticleWithAuthor | null>;
  }

  async create(
    data: TCreateArticleDto,
    authorId: number
  ): Promise<IArticleWithAuthor> {
    return prisma.article.create({
      data: {
        ...data,
        author: { connect: { id: authorId } },
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    }) as Promise<IArticleWithAuthor>;
  }

  async update(
    id: number,
    data: TUpdateArticleDto
  ): Promise<IArticleWithAuthor> {
    return prisma.article.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    }) as Promise<IArticleWithAuthor>;
  }

  async delete(id: number) {
    // 트랜잭션으로 관련 데이터 모두 삭제
    return prisma.$transaction([
      prisma.comment.deleteMany({ where: { articleId: id } }),
      prisma.like.deleteMany({ where: { articleId: id } }),
      prisma.article.delete({ where: { id } }),
    ]);
  }

  async checkLikeStatus(articleId: number, userId: number) {
    return prisma.like.findFirst({
      where: {
        articleId,
        userId,
      },
    });
  }
}
