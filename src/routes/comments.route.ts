import { Router } from "express";
import {
  updateComment,
  deleteComment,
} from "../controllers/comment.controller";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

// 댓글 수정
router.patch("/:id", authenticateToken, updateComment);

// 댓글 삭제
router.delete("/:id", authenticateToken, deleteComment);

export default router;
