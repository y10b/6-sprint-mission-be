import { Request, Response, NextFunction } from "express";
import { FavoriteService } from "../services/favorite.service";
import { BadRequestError } from "../utils/customError";

export class FavoriteController {
  private favoriteService: FavoriteService;

  constructor() {
    this.favoriteService = new FavoriteService();
  }

  toggleFavoriteForProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { productId } = req.params;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ message: "로그인이 필요합니다." });
        return;
      }

      const result = await this.favoriteService.toggleProductFavorite(
        Number(productId),
        userId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  toggleFavoriteForArticle = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { articleId } = req.params;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ message: "로그인이 필요합니다." });
        return;
      }

      const result = await this.favoriteService.toggleArticleFavorite(
        Number(articleId),
        userId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  removeFavoriteForProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { productId } = req.params;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ message: "로그인이 필요합니다." });
        return;
      }

      const result = await this.favoriteService.removeProductFavorite(
        Number(productId),
        userId
      );
      res.status(200).json({
        message: "좋아요가 삭제되었습니다.",
        favoriteCount: result.favoriteCount,
      });
    } catch (error) {
      next(error);
    }
  };

  removeFavoriteForArticle = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { articleId } = req.params;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ message: "로그인이 필요합니다." });
        return;
      }

      await this.favoriteService.removeArticleFavorite(
        Number(articleId),
        userId
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

// 컨트롤러 인스턴스 생성
const favoriteController = new FavoriteController();

// 컨트롤러 메서드 export
export const {
  toggleFavoriteForProduct,
  toggleFavoriteForArticle,
  removeFavoriteForProduct,
  removeFavoriteForArticle,
} = favoriteController;
