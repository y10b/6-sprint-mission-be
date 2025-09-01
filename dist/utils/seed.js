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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
function seed() {
    return __awaiter(this, void 0, void 0, function* () {
        const pageSize = 10;
        let currentPage = 1;
        let hasMoreData = true;
        try {
            /*     // 마이그레이션 먼저 실행
            console.log("데이터베이스 마이그레이션 실행 중...");
            execSync("npx prisma migrate deploy", { stdio: "inherit" });
            console.log(" 마이그레이션 완료!");
         */
            // 0. 기본 유저 생성
            const defaultUser = yield prisma.user.upsert({
                where: { email: "default@user.com" },
                update: {},
                create: {
                    email: "default@user.com",
                    encryptedPassword: yield bcrypt_1.default.hash("dummy-password", 10),
                    nickname: "DefaultUser",
                },
            });
            // 1. 상품 데이터 시딩
            console.log("상품 데이터 시딩 시작...");
            while (hasMoreData) {
                const response = yield axios_1.default.get(`https://panda-market-api.vercel.app/products?page=${currentPage}&limit=${pageSize}`);
                const products = response.data.list;
                if (products.length === 0) {
                    hasMoreData = false;
                    break;
                }
                for (const product of products) {
                    const createdProduct = yield prisma.product.create({
                        data: {
                            name: product.name,
                            description: product.description,
                            price: product.price,
                            tags: product.tags,
                            seller: { connect: { id: defaultUser.id } },
                        },
                    });
                    // 이미지들 저장
                    if (product.images && product.images.length > 0) {
                        const imageData = product.images.map((url) => ({
                            url,
                            productId: createdProduct.id,
                        }));
                        yield prisma.productImage.createMany({
                            data: imageData,
                            skipDuplicates: true,
                        });
                    }
                    // 좋아요 생성 (defaultUser가 여러 번 누른 척, 중복 제거됨)
                    const likeCount = product.favoriteCount || 0;
                    const likeData = Array.from({ length: likeCount }).map(() => ({
                        productId: createdProduct.id,
                        userId: defaultUser.id,
                    }));
                    if (likeData.length > 0) {
                        yield prisma.like.createMany({
                            data: likeData,
                            skipDuplicates: true,
                        });
                    }
                }
                console.log(` 상품 Page ${currentPage} 시딩 완료!`);
                currentPage++;
            }
            // 2. 게시글 데이터 시딩
            console.log("\n게시글 데이터 시딩 시작...");
            currentPage = 1;
            hasMoreData = true;
            while (hasMoreData) {
                const response = yield axios_1.default.get(`https://panda-market-api.vercel.app/articles?page=${currentPage}&limit=${pageSize}`);
                const articles = response.data.list;
                if (articles.length === 0) {
                    hasMoreData = false;
                    break;
                }
                for (const article of articles) {
                    // 게시글 생성
                    const createdArticle = yield prisma.article.create({
                        data: {
                            title: article.title,
                            content: article.content,
                            author: { connect: { id: defaultUser.id } },
                            createdAt: new Date(article.createdAt),
                            updatedAt: new Date(article.updatedAt),
                        },
                    });
                    // 좋아요 생성
                    const likeCount = article.likeCount || 0;
                    const likeData = Array.from({ length: likeCount }).map(() => ({
                        userId: defaultUser.id,
                        articleId: createdArticle.id,
                    }));
                    if (likeData.length > 0) {
                        yield prisma.like.createMany({
                            data: likeData,
                            skipDuplicates: true,
                        });
                    }
                }
                console.log(` 게시글 Page ${currentPage} 시딩 완료!`);
                currentPage++;
            }
            console.log("\n모든 데이터 시딩 완료!");
        }
        catch (error) {
            console.error(" 시딩 중 오류 발생:", error);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
seed();
//# sourceMappingURL=seed.js.map