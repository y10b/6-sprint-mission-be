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
exports.CommentService = void 0;
const prisma_1 = require("../db/prisma");
const customError_1 = require("../utils/customError");
class CommentService {
    createArticleComment(articleId, userId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const article = yield prisma_1.prisma.article.findUnique({
                where: { id: articleId },
            });
            if (!article) {
                throw new customError_1.NotFoundError("게시글을 찾을 수 없습니다.");
            }
            return prisma_1.prisma.comment.create({
                data: {
                    content,
                    articleId,
                    userId,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            nickname: true,
                        },
                    },
                },
            });
        });
    }
    createProductComment(productId, userId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield prisma_1.prisma.product.findUnique({
                where: { id: productId },
            });
            if (!product) {
                throw new customError_1.NotFoundError("상품을 찾을 수 없습니다.");
            }
            return prisma_1.prisma.comment.create({
                data: {
                    content,
                    productId,
                    userId,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            nickname: true,
                        },
                    },
                },
            });
        });
    }
    updateComment(commentId, userId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = yield prisma_1.prisma.comment.findUnique({
                where: { id: commentId },
            });
            if (!comment) {
                throw new customError_1.NotFoundError("댓글을 찾을 수 없습니다.");
            }
            if (comment.userId !== userId) {
                throw new customError_1.ForbiddenError("자신의 댓글만 수정할 수 있습니다.");
            }
            return prisma_1.prisma.comment.update({
                where: { id: commentId },
                data: { content },
                include: {
                    user: {
                        select: {
                            id: true,
                            nickname: true,
                        },
                    },
                },
            });
        });
    }
    deleteComment(commentId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = yield prisma_1.prisma.comment.findUnique({
                where: { id: commentId },
            });
            if (!comment) {
                throw new customError_1.NotFoundError("댓글을 찾을 수 없습니다.");
            }
            if (comment.userId !== userId) {
                throw new customError_1.ForbiddenError("자신의 댓글만 삭제할 수 있습니다.");
            }
            yield prisma_1.prisma.comment.delete({
                where: { id: commentId },
            });
        });
    }
    getCommentsForProduct(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.comment.findMany({
                where: { productId },
                include: {
                    user: {
                        select: {
                            id: true,
                            nickname: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        });
    }
    getCommentsForArticle(articleId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.comment.findMany({
                where: { articleId },
                include: {
                    user: {
                        select: {
                            id: true,
                            nickname: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        });
    }
}
exports.CommentService = CommentService;
//# sourceMappingURL=comment.service.js.map