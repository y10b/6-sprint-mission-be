import { Router } from 'express'
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/product.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { validateProductInput } from '../middlewares/validateProductInput.js'

const productRouter = Router()

productRouter.get('/products', getAllProducts)
productRouter.get('/products/:id', getProductById)
productRouter.post('/products', authenticate, validateProductInput, createProduct)
productRouter.patch('/products/:id', authenticate, updateProduct)
productRouter.delete('/products/:id', authenticate, deleteProduct)

export default productRouter
