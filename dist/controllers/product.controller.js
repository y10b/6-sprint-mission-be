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
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const product_service_1 = require("../services/product.service");
const customError_1 = require("../utils/customError");
const productService = new product_service_1.ProductService();
const getAllProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, sort = "latest", keyword = "" } = req.query;
        const userId = req.userId;
        const result = yield productService.getAllProducts(Number(page), Number(limit), sort, keyword, userId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllProducts = getAllProducts;
const getProductById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const product = yield productService.getProductById(Number(id), userId);
        if (!product) {
            res.status(404).json({ message: "상품을 찾을 수 없습니다." });
            return;
        }
        res.json(product);
    }
    catch (error) {
        next(error);
    }
});
exports.getProductById = getProductById;
const createProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new customError_1.UnauthorizedError("로그인이 필요합니다.");
        }
        const product = yield productService.createProduct(req.body, userId);
        res.status(201).json(product);
    }
    catch (error) {
        next(error);
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.userId;
        if (!userId) {
            throw new customError_1.UnauthorizedError("로그인이 필요합니다.");
        }
        const product = yield productService.updateProduct(Number(id), req.body, userId);
        res.json(product);
    }
    catch (error) {
        if (error instanceof customError_1.NotFoundError || error instanceof customError_1.ForbiddenError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else if (error instanceof Error) {
            next(error);
        }
        else {
            next(new Error("알 수 없는 에러가 발생했습니다."));
        }
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.userId;
        if (!userId) {
            throw new customError_1.UnauthorizedError("로그인이 필요합니다.");
        }
        yield productService.deleteProduct(Number(id), userId);
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof customError_1.NotFoundError || error instanceof customError_1.ForbiddenError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else if (error instanceof Error) {
            next(error);
        }
        else {
            next(new Error("알 수 없는 에러가 발생했습니다."));
        }
    }
});
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=product.controller.js.map