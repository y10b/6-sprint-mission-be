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
exports.FavoriteRepository = void 0;
const prisma_1 = require("../db/prisma");
class FavoriteRepository {
    findProductFavorite(userId, productId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.like.findUnique({
                where: {
                    userId_productId: {
                        userId,
                        productId,
                    },
                },
            });
        });
    }
    findArticleFavorite(userId, articleId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.like.findUnique({
                where: {
                    userId_articleId: {
                        userId,
                        articleId,
                    },
                },
            });
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.like.create({
                data,
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.like.delete({
                where: { id },
            });
        });
    }
    countProductFavorites(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.like.count({
                where: { productId },
            });
        });
    }
    countArticleFavorites(articleId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.like.count({
                where: { articleId },
            });
        });
    }
    transaction(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.$transaction(callback);
        });
    }
}
exports.FavoriteRepository = FavoriteRepository;
//# sourceMappingURL=favorite.repository.js.map