import { Router } from 'express'
import productRouter from './product.route.js'
import articleRouter from './article.route.js';
import commentRouter from './comments.route.js';
import likeRouter from './like.route.js';

const router = Router()

router.use('/api', productRouter)
router.use('/api', articleRouter);
router.use('/api', commentRouter)
router.use('/api', likeRouter);

export default router