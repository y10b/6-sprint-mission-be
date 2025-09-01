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
exports.ProductService = void 0;
const product_repository_1 = require("../repositories/product.repository");
class ProductService {
    constructor() {
        this.productRepository = new product_repository_1.ProductRepository();
    }
    getAllProducts(page, limit, sort, keyword, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            let orderBy;
            if (sort === "likes") {
                orderBy = { likes: { _count: "desc" } };
            }
            else {
                orderBy = { createdAt: "desc" };
            }
            const [totalCount, products] = yield this.productRepository.findAll(skip, limit, keyword, orderBy);
            const formattedProducts = products.map((product) => (Object.assign(Object.assign({}, product), { favoriteCount: product._count.likes, isLiked: false, images: product.images.map((image) => image.url) })));
            if (userId) {
                // 로그인한 사용자의 좋아요 상태 확인
                yield Promise.all(formattedProducts.map((product) => __awaiter(this, void 0, void 0, function* () {
                    const like = yield this.productRepository.checkLikeStatus(product.id, userId);
                    product.isLiked = !!like;
                })));
            }
            return {
                list: formattedProducts,
                totalCount,
            };
        });
    }
    getProductById(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield this.productRepository.findById(id);
            if (!product) {
                return null;
            }
            const isLiked = userId
                ? !!(yield this.productRepository.checkLikeStatus(id, userId))
                : false;
            const { _count, seller, images } = product, rest = __rest(product, ["_count", "seller", "images"]);
            return Object.assign(Object.assign({}, rest), { favoriteCount: _count.likes, sellerNickname: seller.nickname, isLiked, images: images.map((image) => image.url) });
        });
    }
    createProduct(data, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data.name || data.name.trim() === "") {
                throw new Error("상품명은 필수입니다.");
            }
            if (data.price <= 0) {
                throw new Error("가격은 0원 이상이어야 합니다.");
            }
            if (!data.imageUrls || data.imageUrls.length === 0) {
                throw new Error("이미지가 업로드되지 않았습니다.");
            }
            return this.productRepository.create(data, userId);
        });
    }
    updateProduct(id, data, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield this.productRepository.findById(id);
            if (!product) {
                throw new Error("Product not found");
            }
            if (product.sellerId !== userId) {
                throw new Error("You do not have permission to update this product");
            }
            return this.productRepository.update(id, data);
        });
    }
    deleteProduct(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield this.productRepository.findById(id);
            if (!product) {
                throw new Error("Product not found");
            }
            if (product.sellerId !== userId) {
                throw new Error("You do not have permission to delete this product");
            }
            yield this.productRepository.delete(id);
        });
    }
}
exports.ProductService = ProductService;
//# sourceMappingURL=product.service.js.map