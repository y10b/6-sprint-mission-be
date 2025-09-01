"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommentsForArticle = exports.getCommentsForProduct = exports.deleteComment = exports.updateComment = exports.createCommentForProduct = exports.createCommentForArticle = void 0;
const comment_service_1 = require("../services/comment.service");
const commentService = new comment_service_1.CommentService();
// 게시글에 댓글 달기
const createCommentForArticle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { articleId } = req.params;
        const { content } = req.body;
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: "로그인이 필요합니다." });
            return;
        }
        const comment = yield commentService.createArticleComment(Number(articleId), userId, content);
        res.status(201).json(comment);
    }
    catch (error) {
        next(error);
    }
});
exports.createCommentForArticle = createCommentForArticle;
// 상품에 댓글 달기
const createCommentForProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        const { content } = req.body;
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: "로그인이 필요합니다." });
            return;
        }
        const comment = yield commentService.createProductComment(Number(productId), userId, content);
        res.status(201).json(comment);
    }
    catch (error) {
        next(error);
    }
});
exports.createCommentForProduct = createCommentForProduct;
// 댓글 수정
const updateComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: "로그인이 필요합니다." });
            return;
        }
        const comment = yield commentService.updateComment(Number(id), userId, content);
        res.json(comment);
    }
    catch (error) {
        next(error);
    }
});
exports.updateComment = updateComment;
// 댓글 삭제
const deleteComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: "로그인이 필요합니다." });
            return;
        }
        yield commentService.deleteComment(Number(id), userId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
exports.deleteComment = deleteComment;
// 상품의 댓글 조회
const getCommentsForProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        const comments = yield commentService.getCommentsForProduct(Number(productId));
        res.json(comments);
    }
    catch (error) {
        next(error);
    }
});
exports.getCommentsForProduct = getCommentsForProduct;
// 게시글의 댓글 조회
const getCommentsForArticle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { articleId } = req.params;
        const comments = yield commentService.getCommentsForArticle(Number(articleId));
        res.json(comments);
    }
    catch (error) {
        next(error);
    }
});
exports.getCommentsForArticle = getCommentsForArticle;
//# sourceMappingURL=comment.controller.js.map