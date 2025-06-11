import { Router, Request, Response, NextFunction } from "express";
import { ArticleController } from "../controllers/article.controller";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const articleController = new ArticleController();

// 게시글 목록 조회
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  await articleController.getArticles(req, res, next);
});

// 게시글 상세 조회
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  await articleController.getArticle(req, res, next);
});

// 게시글 생성
router.post(
  "/",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    await articleController.createArticle(req, res, next);
  }
);

// 게시글 수정
router.put(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    await articleController.updateArticle(req, res, next);
  }
);

// 게시글 삭제
router.delete(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    await articleController.deleteArticle(req, res, next);
  }
);

export default router;
