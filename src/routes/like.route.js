import express from 'express';
import { removeLikeForArticle, removeLikeForProduct, toggleLikeForArticle, toggleLikeForProduct } from '../controllers/like.controller.js';
import { authenticate } from '../middlewares/auth.js';

const likeRouter = express.Router();

// 게시글 좋아요 토글
likeRouter.post('/articles/:articleId/like', authenticate, toggleLikeForArticle);

// 상품 좋아요 토글
likeRouter.post('/products/:productId/like', authenticate, toggleLikeForProduct);

// 게시글 좋아요 삭제
likeRouter.delete('/articles/:articleId/like', authenticate, removeLikeForArticle);

// 상품 좋아요 삭제
likeRouter.delete('/products/:productId/like', authenticate, removeLikeForProduct);


export default likeRouter;
