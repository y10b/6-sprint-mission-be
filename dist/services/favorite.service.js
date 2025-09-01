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
exports.FavoriteService = void 0;
const prisma_1 = require("../db/prisma");
const customError_1 = require("../utils/customError");
class FavoriteService {
    toggleArticleFavorite(articleId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const article = yield prisma_1.prisma.article.findUnique({
                where: { id: articleId },
            });
            if (!article) {
                throw new customError_1.NotFoundError("게시글을 찾을 수 없습니다.");
            }
            const existingFavorite = yield prisma_1.prisma.like.findUnique({
                where: {
                    userId_articleId: {
                        userId,
                        articleId,
                    },
                },
            });
            if (existingFavorite) {
                yield prisma_1.prisma.like.delete({
                    where: {
                        userId_articleId: {
                            userId,
                            articleId,
                        },
                    },
                });
                return { liked: false };
            }
            else {
                yield prisma_1.prisma.like.create({
                    data: {
                        userId,
                        articleId,
                    },
                });
                return { liked: true };
            }
        });
    }
    toggleProductFavorite(productId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield prisma_1.prisma.product.findUnique({
                where: { id: productId },
            });
            if (!product) {
                throw new customError_1.NotFoundError("상품을 찾을 수 없습니다.");
            }
            const existingFavorite = yield prisma_1.prisma.like.findUnique({
                where: {
                    userId_productId: {
                        userId,
                        productId,
                    },
                },
            });
            if (existingFavorite) {
                yield prisma_1.prisma.like.delete({
                    where: {
                        userId_productId: {
                            userId,
                            productId,
                        },
                    },
                });
                const favoriteCount = yield prisma_1.prisma.like.count({
                    where: { productId },
                });
                return { liked: false, favoriteCount };
            }
            else {
                yield prisma_1.prisma.like.create({
                    data: {
                        userId,
                        productId,
                    },
                });
                const favoriteCount = yield prisma_1.prisma.like.count({
                    where: { productId },
                });
                return { liked: true, favoriteCount };
            }
        });
    }
    removeArticleFavorite(articleId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const favorite = yield prisma_1.prisma.like.findUnique({
                where: {
                    userId_articleId: {
                        userId,
                        articleId,
                    },
                },
            });
            if (!favorite) {
                throw new customError_1.NotFoundError("좋아요를 찾을 수 없습니다.");
            }
            yield prisma_1.prisma.like.delete({
                where: {
                    userId_articleId: {
                        userId,
                        articleId,
                    },
                },
            });
        });
    }
    removeProductFavorite(productId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const favorite = yield prisma_1.prisma.like.findUnique({
                where: {
                    userId_productId: {
                        userId,
                        productId,
                    },
                },
            });
            if (!favorite) {
                throw new customError_1.NotFoundError("좋아요를 찾을 수 없습니다.");
            }
            yield prisma_1.prisma.like.delete({
                where: {
                    userId_productId: {
                        userId,
                        productId,
                    },
                },
            });
            // 삭제 후 남은 좋아요 수 계산
            const favoriteCount = yield prisma_1.prisma.like.count({
                where: {
                    productId,
                },
            });
            return { favoriteCount };
        });
    }
}
exports.FavoriteService = FavoriteService;
//# sourceMappingURL=favorite.service.js.map