const express = require("express")
const articlesRouter = require("./articles")
const commentsRouter = require("./comments")
const productsRouter = require("./products")

const router = express.Router()

router.use('/articles', articlesRouter)
router.use('/comments', commentsRouter)
router.use('/products', productsRouter)

module.exports = router