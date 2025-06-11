import { PrismaClient, Article, Prisma } from "@prisma/client";

export class ArticleRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: {
    title: string;
    content: string;
    authorId: number;
  }): Promise<Article> {
    return this.prisma.article.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });
  }

  async findById(id: number): Promise<Article | null> {
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
    });
  }

  async update(
    id: number,
    data: { title: string; content: string }
  ): Promise<Article> {
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
      },
    });
  }

  async delete(id: number): Promise<Article> {
    return this.prisma.article.delete({
      where: { id },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ArticleWhereUniqueInput;
    where?: Prisma.ArticleWhereInput;
    orderBy?: Prisma.ArticleOrderByWithRelationInput;
  }): Promise<Article[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.article.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
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
    });
  }

  async count(where: Prisma.ArticleWhereInput): Promise<number> {
    return this.prisma.article.count({ where });
  }

  async findUserLike(userId: number, articleId: number): Promise<boolean> {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });
    return !!like;
  }
}
