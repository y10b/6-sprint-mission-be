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
exports.ArticleController = exports.getArticleById = exports.getAllArticles = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../db/prisma");
const customError_1 = require("../utils/customError");
const article_service_1 = require("../services/article.service");
// 모든 게시글 조회
const getAllArticles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, sort = "latest", search = "" } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        // 정렬 조건 설정
        let orderBy;
        if (sort === "likes") {
            orderBy = {
                likes: {
                    _count: client_1.Prisma.SortOrder.desc,
                },
            };
        }
        else {
            orderBy = { createdAt: client_1.Prisma.SortOrder.desc }; // 최신순 (기본)
        }
        // 검색 조건 (title, content)
        const where = search
            ? {
                OR: [
                    {
                        title: {
                            contains: search,
                            mode: client_1.Prisma.QueryMode.insensitive,
                        },
                    },
                    {
                        content: {
                            contains: search,
                            mode: client_1.Prisma.QueryMode.insensitive,
                        },
                    },
                ],
            }
            : {};
        // 전체 게시글 수
        const totalCount = yield prisma_1.prisma.article.count({ where });
        // 게시글 목록 가져오기
        const articles = yield prisma_1.prisma.article.findMany({
            where,
            orderBy,
            skip,
            take: Number(limit),
            include: {
                comments: true,
                likes: true,
            },
        });
        res.json({
            success: true,
            data: {
                list: articles,
                totalCount,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllArticles = getAllArticles;
// 특정 게시글 조회
const getArticleById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const article = yield prisma_1.prisma.article.findUnique({
            where: { id: parseInt(id) },
            include: {
                comments: true,
                likes: true,
            },
        });
        if (!article) {
            throw new customError_1.NotFoundError("게시글을 찾을 수 없습니다.");
        }
        res.json({ success: true, data: article });
    }
    catch (error) {
        next(error);
    }
});
exports.getArticleById = getArticleById;
class ArticleController {
    constructor() {
        this.articleService = new article_service_1.ArticleService();
    }
    getArticles(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { page = 1, limit = 10, sort = "latest", keyword = "" } = req.query;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const result = yield this.articleService.getAllArticles(Number(page), Number(limit), sort, keyword, userId);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getArticle(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const article = yield this.articleService.getArticle(Number(id), userId);
                res.json(article);
            }
            catch (error) {
                next(error);
            }
        });
    }
    createArticle(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { title, content, images } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ message: "로그인이 필요합니다." });
                    return;
                }
                const article = yield this.articleService.createArticle(userId, {
                    title,
                    content,
                    images,
                });
                res.status(201).json(article);
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateArticle(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const { title, content, images } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ message: "로그인이 필요합니다." });
                    return;
                }
                const article = yield this.articleService.updateArticle(Number(id), userId, {
                    title,
                    content,
                    images,
                });
                res.json(article);
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteArticle(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ message: "로그인이 필요합니다." });
                    return;
                }
                yield this.articleService.deleteArticle(Number(id), userId);
                res.status(204).send();
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.ArticleController = ArticleController;
//# sourceMappingURL=article.controller.js.map