import { Router } from 'express'
import productRouter from './product.routes.js'
import articleRouter from './article.routes.js';

const router = Router()

router.use('/api', productRouter)
router.use('/api', articleRouter);

export default router