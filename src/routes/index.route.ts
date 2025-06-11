import { Router } from "express";
import productRouter from "./product.routes";
import articleRouter from "./article.route";
import commentRouter from "./comments.route";
import likeRouter from "./like.route";

const router = Router();

router.use("/api/products", productRouter);
router.use("/api/articles", articleRouter);
router.use("/api/comments", commentRouter);
router.use("/api/likes", likeRouter);

export default router;
