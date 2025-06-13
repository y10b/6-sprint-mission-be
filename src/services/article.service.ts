import { ArticleRepository } from "../repositories/article.repository";
import { Prisma } from "@prisma/client";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "../utils/customError";
import {
  ArticleWithDetails,
  ArticleListResponse,
  CreateArticleDto,
  UpdateArticleDto,
} from "../types/article.types";

export class ArticleService {
  private articleRepository: ArticleRepository;

  constructor() {
    this.articleRepository = new ArticleRepository();
  }

  async getAllArticles(
    page: number,
    limit: number,
    sort: string,
    keyword: string,
    userId?: number
  ): Promise<ArticleListResponse> {
    const skip = (page - 1) * limit;

    // 정렬 조건 설정
    let orderBy: Prisma.ArticleOrderByWithRelationInput;
    if (sort === "likes") {
      orderBy = {
        likes: {
          _count: "desc",
        },
      };
    } else {
      orderBy = { createdAt: "desc" }; // 최신순 (기본)
    }

    const [totalCount, articles] = await this.articleRepository.findAll(
      skip,
      limit,
      keyword,
      orderBy
    );

    const articlesWithDetails = await Promise.all(
      articles.map(async (article) => {
        const isLiked = userId
          ? !!(await this.articleRepository.checkLikeStatus(article.id, userId))
          : false;

        const { _count, author, ...rest } = article;
        return {
          ...rest,
          authorNickname: author.nickname,
          likeCount: _count.likes,
          isLiked,
        };
      })
    );

    return {
      articles: articlesWithDetails,
      totalCount,
    };
  }

  async getArticle(id: number, userId?: number): Promise<ArticleWithDetails> {
    const article = await this.articleRepository.findById(id);

    if (!article) {
      throw new NotFoundError("게시글을 찾을 수 없습니다.");
    }

    const isLiked = userId
      ? !!(await this.articleRepository.checkLikeStatus(id, userId))
      : false;

    const { _count, author, ...rest } = article;
    return {
      ...rest,
      authorNickname: author.nickname,
      likeCount: _count.likes,
      isLiked,
    };
  }

  async createArticle(
    authorId: number,
    data: CreateArticleDto
  ): Promise<ArticleWithDetails> {
    if (!data.title || !data.content) {
      throw new BadRequestError("제목과 내용을 모두 입력해주세요.");
    }

    const article = await this.articleRepository.create(data, authorId);
    return {
      ...article,
      authorNickname: article.author.nickname,
      likeCount: 0,
      isLiked: false,
    };
  }

  async updateArticle(
    id: number,
    authorId: number,
    data: UpdateArticleDto
  ): Promise<ArticleWithDetails> {
    const article = await this.articleRepository.findById(id);

    if (!article) {
      throw new NotFoundError("게시글을 찾을 수 없습니다.");
    }

    if (article.authorId !== authorId) {
      throw new ForbiddenError("본인의 게시글만 수정할 수 있습니다.");
    }

    const updatedArticle = await this.articleRepository.update(id, data);
    return {
      ...updatedArticle,
      authorNickname: updatedArticle.author.nickname,
      likeCount: 0,
      isLiked: false,
    };
  }

  async deleteArticle(id: number, authorId: number): Promise<void> {
    const article = await this.articleRepository.findById(id);

    if (!article) {
      throw new NotFoundError("게시글을 찾을 수 없습니다.");
    }

    if (article.authorId !== authorId) {
      throw new ForbiddenError("본인의 게시글만 삭제할 수 있습니다.");
    }

    await this.articleRepository.delete(id);
  }
}
