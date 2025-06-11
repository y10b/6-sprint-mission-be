import { Router } from "express";
import {
  removeLikeForArticle,
  removeLikeForProduct,
  toggleLikeForArticle,
  toggleLikeForProduct,
} from "../controllers/like.controller";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

// 게시글 좋아요 토글
router.post(
  "/articles/:articleId/like",
  authenticateToken,
  toggleLikeForArticle
);

// 상품 좋아요 토글
router.post(
  "/products/:productId/like",
  authenticateToken,
  toggleLikeForProduct
);

// 게시글 좋아요 삭제
router.delete(
  "/articles/:articleId/like",
  authenticateToken,
  removeLikeForArticle
);

// 상품 좋아요 삭제
router.delete(
  "/products/:productId/like",
  authenticateToken,
  removeLikeForProduct
);

export default router;
