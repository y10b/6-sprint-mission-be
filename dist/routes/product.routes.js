"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController = __importStar(require("../controllers/product.controller"));
const auth_1 = require("../middlewares/auth");
const comment_controller_1 = require("../controllers/comment.controller");
const favorite_controller_1 = require("../controllers/favorite.controller");
const router = (0, express_1.Router)();
// 상품 목록 조회 (인증 선택)
router.get("/", auth_1.authenticateToken.optional, productController.getAllProducts);
// 상품 상세 조회 (인증 선택)
router.get("/:id", auth_1.authenticateToken.optional, productController.getProductById);
// 상품 생성 (인증 필수)
router.post("/", auth_1.authenticateToken.required, productController.createProduct);
// 상품 수정 (인증 필수)
router.patch("/:id", auth_1.authenticateToken.required, productController.updateProduct);
// 상품 삭제 (인증 필수)
router.delete("/:id", auth_1.authenticateToken.required, productController.deleteProduct);
// 상품에 댓글 달기
router.post("/:productId/comments", auth_1.authenticateToken, comment_controller_1.createCommentForProduct);
// 상품의 댓글 조회
router.get("/:productId/comments", comment_controller_1.getCommentsForProduct);
// 상품 좋아요 토글
router.post("/:productId/favorite", auth_1.authenticateToken, favorite_controller_1.toggleFavoriteForProduct);
// 상품 좋아요 삭제
router.delete("/:productId/favorite", auth_1.authenticateToken, favorite_controller_1.removeFavoriteForProduct);
exports.default = router;
//# sourceMappingURL=product.routes.js.map