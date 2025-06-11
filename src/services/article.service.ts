import { Article, Prisma } from "@prisma/client";
import { ArticleRepository } from "../repositories/article.repository";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "../utils/customError";

interface ArticleListResponse {
  articles: Article[];
  nextCursor: number | null;
  totalCount: number;
}

export class ArticleService {
  private articleRepository: ArticleRepository;

  constructor() {
    this.articleRepository = new ArticleRepository();
  }

  async createArticle(
    userId: number,
    title: string,
    content: string
  ): Promise<Article> {
    if (!title || !content) {
      throw new BadRequestError("제목과 내용을 모두 입력해주세요.");
    }

    return this.articleRepository.create({
      title,
      content,
      authorId: userId,
    });
  }

  async getArticle(
    id: number,
    userId?: number
  ): Promise<Article & { liked?: boolean }> {
    const article = await this.articleRepository.findById(id);

    if (!article) {
      throw new NotFoundError("게시글을 찾을 수 없습니다.");
    }

    let liked = false;
    if (userId) {
      liked = await this.articleRepository.findUserLike(userId, id);
    }

    return {
      ...article,
      liked,
    };
  }

  async updateArticle(
    id: number,
    userId: number,
    title: string,
    content: string
  ): Promise<Article> {
    if (!title || !content) {
      throw new BadRequestError("제목과 내용을 모두 입력해주세요.");
    }

    const article = await this.articleRepository.findById(id);

    if (!article) {
      throw new NotFoundError("게시글을 찾을 수 없습니다.");
    }

    if (article.authorId !== userId) {
      throw new ForbiddenError("본인의 게시글만 수정할 수 있습니다.");
    }

    return this.articleRepository.update(id, {
      title,
      content,
    });
  }

  async deleteArticle(id: number, userId: number): Promise<void> {
    const article = await this.articleRepository.findById(id);

    if (!article) {
      throw new NotFoundError("게시글을 찾을 수 없습니다.");
    }

    if (article.authorId !== userId) {
      throw new ForbiddenError("본인의 게시글만 삭제할 수 있습니다.");
    }

    await this.articleRepository.delete(id);
  }

  async getArticles(params: {
    skip?: number;
    take?: number;
    cursor?: number;
    where?: Prisma.ArticleWhereInput;
    orderBy?: Prisma.ArticleOrderByWithRelationInput;
  }): Promise<ArticleListResponse> {
    const { skip, take = 10, cursor, where, orderBy } = params;

    const articles = await this.articleRepository.findMany({
      skip,
      take: take + 1,
      cursor: cursor ? { id: cursor } : undefined,
      where,
      orderBy: orderBy || { createdAt: "desc" },
    });

    const hasNextPage = articles.length > take;
    const items = hasNextPage ? articles.slice(0, -1) : articles;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;
    const totalCount = await this.articleRepository.count(where || {});

    return {
      articles: items,
      nextCursor,
      totalCount,
    };
  }
}
