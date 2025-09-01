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
exports.ArticleRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../db/prisma");
class ArticleRepository {
    findAll(skip, take, keyword, orderBy) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = keyword
                ? {
                    OR: [
                        {
                            title: { contains: keyword, mode: client_1.Prisma.QueryMode.insensitive },
                        },
                        {
                            content: {
                                contains: keyword,
                                mode: client_1.Prisma.QueryMode.insensitive,
                            },
                        },
                    ],
                }
                : {};
            return Promise.all([
                prisma_1.prisma.article.count({ where }),
                prisma_1.prisma.article.findMany({
                    where,
                    orderBy,
                    skip,
                    take,
                    include: {
                        _count: {
                            select: { likes: true },
                        },
                        author: {
                            select: {
                                id: true,
                                nickname: true,
                            },
                        },
                    },
                }),
            ]);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.article.findUnique({
                where: { id },
                include: {
                    author: {
                        select: {
                            id: true,
                            nickname: true,
                        },
                    },
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        },
                    },
                },
            });
        });
    }
    create(data, authorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.article.create({
                data: Object.assign(Object.assign({}, data), { author: { connect: { id: authorId } } }),
                include: {
                    author: {
                        select: {
                            id: true,
                            nickname: true,
                        },
                    },
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        },
                    },
                },
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.article.update({
                where: { id },
                data,
                include: {
                    author: {
                        select: {
                            id: true,
                            nickname: true,
                        },
                    },
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        },
                    },
                },
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // 트랜잭션으로 관련 데이터 모두 삭제
            return prisma_1.prisma.$transaction([
                prisma_1.prisma.comment.deleteMany({ where: { articleId: id } }),
                prisma_1.prisma.like.deleteMany({ where: { articleId: id } }),
                prisma_1.prisma.article.delete({ where: { id } }),
            ]);
        });
    }
    checkLikeStatus(articleId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.like.findFirst({
                where: {
                    articleId,
                    userId,
                },
            });
        });
    }
}
exports.ArticleRepository = ArticleRepository;
//# sourceMappingURL=article.repository.js.map