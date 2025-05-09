// src/routes/comments.js

import express from 'express';
import {
    createCommentForArticle,
    createCommentForProduct,
    updateComment,
    deleteComment,
} from '../controllers/comment.controller.js';
import { authenticate } from '../middlewares/auth.js';

const commentRouter = express.Router();

// 게시글에 댓글 달기
commentRouter.post('/articles/:articleId/comments', authenticate, createCommentForArticle);

// 상품에 댓글 달기
commentRouter.post('/products/:productId/comments', authenticate, createCommentForProduct);

// 댓글 수정
commentRouter.put('/comments/:id', authenticate, updateComment);

// 댓글 삭제
commentRouter.delete('/comments/:id', authenticate, deleteComment);

export default commentRouter;
