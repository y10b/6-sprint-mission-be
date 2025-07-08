import { Router } from "express";
import productRouter from "./product.routes";
import articleRouter from "./article.route";
import commentRouter from "./comments.route";
import uploadRouter from "./upload.route";
import healthRouter from "./health.route";

const router = Router();

// 헬스체크 라우터 (api 접두사 없이)
router.use("/health", healthRouter);

router.use("/api/products", productRouter);
router.use("/api/articles", articleRouter);
router.use("/api/comments", commentRouter);
router.use("/api/upload", uploadRouter);

export default router;
