import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { authenticateToken } from "../middlewares/auth";
import {
  createCommentForProduct,
  getCommentsForProduct,
} from "../controllers/comment.controller";
import {
  toggleLikeForProduct,
  removeLikeForProduct,
} from "../controllers/like.controller";

const router = Router();

// 상품 목록 조회 (인증 선택)
router.get("/", authenticateToken.optional, productController.getAllProducts);

// 상품 상세 조회 (인증 선택)
router.get(
  "/:id",
  authenticateToken.optional,
  productController.getProductById
);

// 상품 생성 (인증 필수)
router.post("/", authenticateToken.required, productController.createProduct);

// 상품 수정 (인증 필수)
router.patch(
  "/:id",
  authenticateToken.required,
  productController.updateProduct
);

// 상품 삭제 (인증 필수)
router.delete(
  "/:id",
  authenticateToken.required,
  productController.deleteProduct
);

// 상품에 댓글 달기
router.post("/:productId/comments", authenticateToken, createCommentForProduct);

// 상품의 댓글 조회
router.get("/:productId/comments", getCommentsForProduct);

// 상품 좋아요 토글
router.post("/:productId/like", authenticateToken, toggleLikeForProduct);

// 상품 좋아요 삭제
router.delete("/:productId/like", authenticateToken, removeLikeForProduct);

export default router;
