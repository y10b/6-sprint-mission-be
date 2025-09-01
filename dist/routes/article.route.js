"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const article_controller_1 = require("../controllers/article.controller");
const auth_1 = require("../middlewares/auth");
const favorite_controller_1 = require("../controllers/favorite.controller");
const comment_controller_1 = require("../controllers/comment.controller");
const router = (0, express_1.Router)();
const articleController = new article_controller_1.ArticleController();
// 게시글 목록 조회
router.get("/", articleController.getArticles.bind(articleController));
// 게시글 상세 조회
router.get("/:id", auth_1.authenticateToken, articleController.getArticle.bind(articleController));
// 게시글 생성
router.post("/", auth_1.authenticateToken, articleController.createArticle.bind(articleController));
// 게시글 수정
router.patch("/:id", auth_1.authenticateToken, articleController.updateArticle.bind(articleController));
// 게시글 삭제
router.delete("/:id", auth_1.authenticateToken, articleController.deleteArticle.bind(articleController));
// 게시글 좋아요 토글
router.post("/:articleId/favorite", auth_1.authenticateToken, favorite_controller_1.toggleFavoriteForArticle);
// 게시글 좋아요 취소
router.delete("/:articleId/favorite", auth_1.authenticateToken, favorite_controller_1.removeFavoriteForArticle);
// 게시글 댓글 작성
router.post("/:articleId/comments", auth_1.authenticateToken, comment_controller_1.createCommentForArticle);
// 게시글 댓글 조회
router.get("/:articleId/comments", comment_controller_1.getCommentsForArticle);
exports.default = router;
//# sourceMappingURL=article.route.js.map