import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { NotFoundError, BadRequestError } from "../utils/customError";
import { ArticleService } from "../services/article.service";

const prisma = new PrismaClient();

// 모든 게시글 조회
export const getAllArticles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, sort = "latest", search = "" } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // 정렬 조건 설정
    let orderBy: Prisma.ArticleOrderByWithRelationInput;
    if (sort === "likes") {
      orderBy = {
        likes: {
          _count: Prisma.SortOrder.desc,
        },
      };
    } else {
      orderBy = { createdAt: Prisma.SortOrder.desc }; // 최신순 (기본)
    }

    // 검색 조건 (title, content)
    const where: Prisma.ArticleWhereInput = search
      ? {
          OR: [
            {
              title: {
                contains: search as string,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              content: {
                contains: search as string,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {};

    // 전체 게시글 수
    const totalCount = await prisma.article.count({ where });

    // 게시글 목록 가져오기
    const articles = await prisma.article.findMany({
      where,
      orderBy,
      skip,
      take: Number(limit),
      include: {
        comments: true,
        likes: true,
      },
    });

    res.json({
      success: true,
      data: {
        list: articles,
        totalCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 특정 게시글 조회
export const getArticleById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;

  try {
    const article = await prisma.article.findUnique({
      where: { id: parseInt(id) },
      include: {
        comments: true,
        likes: true,
      },
    });

    if (!article) {
      throw new NotFoundError("게시글을 찾을 수 없습니다.");
    }

    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

export class ArticleController {
  private articleService: ArticleService;

  constructor() {
    this.articleService = new ArticleService();
  }

  async createArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, content } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const article = await this.articleService.createArticle(
        userId,
        title,
        content
      );
      res.status(201).json(article);
    } catch (error) {
      next(error);
    }
  }

  async getArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const article = await this.articleService.getArticle(Number(id), userId);
      res.json(article);
    } catch (error) {
      next(error);
    }
  }

  async updateArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const article = await this.articleService.updateArticle(
        Number(id),
        userId,
        title,
        content
      );
      res.json(article);
    } catch (error) {
      next(error);
    }
  }

  async deleteArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      await this.articleService.deleteArticle(Number(id), userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const { cursor, take } = req.query;

      const articles = await this.articleService.getArticles({
        cursor: cursor ? Number(cursor) : undefined,
        take: take ? Number(take) : undefined,
      });

      res.json(articles);
    } catch (error) {
      next(error);
    }
  }
}
