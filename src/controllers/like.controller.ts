import { Request, Response, NextFunction } from "express";
import { LikeService } from "../services/like.service";
import { BadRequestError } from "../utils/customError";

export class LikeController {
  private likeService: LikeService;

  constructor() {
    this.likeService = new LikeService();
  }

  toggleLikeForProduct = async (
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

      const result = await this.likeService.toggleProductLike(
        Number(productId),
        userId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  toggleLikeForArticle = async (
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

      const result = await this.likeService.toggleArticleLike(
        Number(articleId),
        userId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  removeLikeForProduct = async (
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

      await this.likeService.removeProductLike(Number(productId), userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  removeLikeForArticle = async (
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

      await this.likeService.removeArticleLike(Number(articleId), userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

// 컨트롤러 인스턴스 생성
const likeController = new LikeController();

// 컨트롤러 메서드 export
export const {
  toggleLikeForProduct,
  toggleLikeForArticle,
  removeLikeForProduct,
  removeLikeForArticle,
} = likeController;
