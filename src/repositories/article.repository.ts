import { PrismaClient, Article, Prisma } from "@prisma/client";
import { CreateArticleDto, UpdateArticleDto } from "../types/article.types";

interface ArticleWithAuthor extends Article {
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
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findAll(
    skip: number,
    take: number,
    keyword: string,
    orderBy: Prisma.ArticleOrderByWithRelationInput
  ): Promise<[number, ArticleWithAuthor[]]> {
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
      this.prisma.article.count({ where }),
      this.prisma.article.findMany({
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
      }) as Promise<ArticleWithAuthor[]>,
    ]);
  }

  async findById(id: number): Promise<ArticleWithAuthor | null> {
    return this.prisma.article.findUnique({
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
    }) as Promise<ArticleWithAuthor | null>;
  }

  async create(
    data: CreateArticleDto,
    authorId: number
  ): Promise<ArticleWithAuthor> {
    return this.prisma.article.create({
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
    }) as Promise<ArticleWithAuthor>;
  }

  async update(id: number, data: UpdateArticleDto): Promise<ArticleWithAuthor> {
    return this.prisma.article.update({
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
    }) as Promise<ArticleWithAuthor>;
  }

  async delete(id: number) {
    // 트랜잭션으로 관련 데이터 모두 삭제
    return this.prisma.$transaction([
      this.prisma.comment.deleteMany({ where: { articleId: id } }),
      this.prisma.like.deleteMany({ where: { articleId: id } }),
      this.prisma.article.delete({ where: { id } }),
    ]);
  }

  async checkLikeStatus(articleId: number, userId: number) {
    return this.prisma.like.findFirst({
      where: {
        articleId,
        userId,
      },
    });
  }
}
