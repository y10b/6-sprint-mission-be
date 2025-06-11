import { Router, Request, Response, NextFunction } from "express";
import {
  createCommentForArticle,
  createCommentForProduct,
  updateComment,
  deleteComment,
  getCommentsForProduct,
} from "../controllers/comment.controller";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

// 게시글에 댓글 달기
router.post(
  "/articles/:articleId/comments",
  authenticateToken,
  createCommentForArticle
);

// 상품에 댓글 달기
router.post(
  "/products/:productId/comments",
  authenticateToken,
  createCommentForProduct
);

// 댓글 수정
router.patch("/:id", authenticateToken, updateComment);

// 댓글 삭제
router.delete("/:id", authenticateToken, deleteComment);

// 댓글 조회
router.get("/products/:productId/comments", getCommentsForProduct);

export default router;
