"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_routes_1 = __importDefault(require("./product.routes"));
const article_route_1 = __importDefault(require("./article.route"));
const comments_route_1 = __importDefault(require("./comments.route"));
const upload_route_1 = __importDefault(require("./upload.route"));
const health_route_1 = __importDefault(require("./health.route"));
const router = (0, express_1.Router)();
// 헬스체크 라우터 (api 접두사 없이)
router.use("/health", health_route_1.default);
router.use("/api/products", product_routes_1.default);
router.use("/api/articles", article_route_1.default);
router.use("/api/comments", comments_route_1.default);
router.use("/api/upload", upload_route_1.default);
exports.default = router;
//# sourceMappingURL=index.route.js.map