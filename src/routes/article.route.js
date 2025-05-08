import { Router } from 'express';
import {
    getAllArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
} from '../controllers/article.controller.js';
import { authenticate } from '../middlewares/auth.js';

const articleRouter = Router();

articleRouter.get('/articles', getAllArticles);
articleRouter.get('/articles/:id', getArticleById);
articleRouter.post('/articles', authenticate, createArticle);
articleRouter.patch('/articles/:id', authenticate, updateArticle); // 수정 시 PATCH 사용
articleRouter.delete('/articles/:id', authenticate, deleteArticle);

export default articleRouter;