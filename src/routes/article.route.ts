import { Router } from "express";
import { ArticleController } from "../controllers/article.controller";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const articleController = new ArticleController();

// 게시글 목록 조회
router.get("/", articleController.getArticles.bind(articleController));

// 게시글 상세 조회
router.get(
  "/:id",
  authenticateToken,
  articleController.getArticle.bind(articleController)
);

// 게시글 생성
router.post(
  "/",
  authenticateToken,
  articleController.createArticle.bind(articleController)
);

// 게시글 수정
router.patch(
  "/:id",
  authenticateToken,
  articleController.updateArticle.bind(articleController)
);

// 게시글 삭제
router.delete(
  "/:id",
  authenticateToken,
  articleController.deleteArticle.bind(articleController)
);

export default router;
