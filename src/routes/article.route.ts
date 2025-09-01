import { Router } from "express";
import { ArticleController } from "../controllers/article.controller";
import { authenticateToken } from "../middlewares/auth";
import {
  toggleFavoriteForArticle,
  removeFavoriteForArticle,
} from "../controllers/favorite.controller";
import {
  createCommentForArticle,
  getCommentsForArticle,
} from "../controllers/comment.controller";

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

// 게시글 좋아요 토글
router.post(
  "/:articleId/favorite",
  authenticateToken,
  toggleFavoriteForArticle
);

// 게시글 좋아요 취소
router.delete(
  "/:articleId/favorite",
  authenticateToken,
  removeFavoriteForArticle
);

// 게시글 댓글 작성
router.post("/:articleId/comments", authenticateToken, createCommentForArticle);

// 게시글 댓글 조회
router.get("/:articleId/comments", getCommentsForArticle);

export default router;
