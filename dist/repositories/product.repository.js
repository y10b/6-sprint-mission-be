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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../db/prisma");
class ProductRepository {
    findAll(skip, take, keyword, orderBy) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = keyword
                ? {
                    OR: [
                        { name: { contains: keyword, mode: client_1.Prisma.QueryMode.insensitive } },
                        {
                            description: {
                                contains: keyword,
                                mode: client_1.Prisma.QueryMode.insensitive,
                            },
                        },
                    ],
                }
                : {};
            return Promise.all([
                prisma_1.prisma.product.count({ where }),
                prisma_1.prisma.product.findMany({
                    where,
                    orderBy,
                    skip,
                    take,
                    include: {
                        _count: {
                            select: { likes: true },
                        },
                        likes: false,
                        images: true,
                    },
                }),
            ]);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.product.findUnique({
                where: { id },
                include: {
                    comments: true,
                    _count: {
                        select: { likes: true },
                    },
                    seller: {
                        select: { nickname: true },
                    },
                    images: true,
                },
            });
        });
    }
    create(data, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.product.create({
                data: {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    tags: data.tags,
                    seller: { connect: { id: userId } },
                    images: {
                        create: data.imageUrls.map((url) => ({ url })),
                    },
                },
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { imageUrls } = data, productData = __rest(data, ["imageUrls"]);
            // 트랜잭션으로 처리
            return prisma_1.prisma.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
                // 기존 이미지 삭제
                if (imageUrls) {
                    yield prisma.product.update({
                        where: { id },
                        data: {
                            images: {
                                deleteMany: {},
                            },
                        },
                    });
                    // 새 이미지 추가
                    if (imageUrls.length > 0) {
                        yield prisma.product.update({
                            where: { id },
                            data: {
                                images: {
                                    create: imageUrls.map((url) => ({ url })),
                                },
                            },
                        });
                    }
                }
                // 상품 정보 업데이트
                return prisma.product.update({
                    where: { id },
                    data: productData,
                    include: {
                        images: true,
                        _count: {
                            select: { likes: true },
                        },
                        seller: {
                            select: { nickname: true },
                        },
                    },
                });
            }));
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // 트랜잭션으로 관련 데이터 모두 삭제
            return prisma_1.prisma.$transaction([
                prisma_1.prisma.comment.deleteMany({ where: { productId: id } }),
                prisma_1.prisma.like.deleteMany({ where: { productId: id } }),
                prisma_1.prisma.productImage.deleteMany({ where: { productId: id } }),
                prisma_1.prisma.product.delete({ where: { id } }),
            ]);
        });
    }
    checkLikeStatus(productId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.like.findFirst({
                where: {
                    productId,
                    userId,
                },
            });
        });
    }
}
exports.ProductRepository = ProductRepository;
//# sourceMappingURL=product.repository.js.map