import { Router } from 'express'
import productRouter from './product.route.js'
import articleRouter from './article.route.js';

const router = Router()

router.use('/api', productRouter)
router.use('/api', articleRouter);

export default router