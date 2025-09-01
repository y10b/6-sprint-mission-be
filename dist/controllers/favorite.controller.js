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
exports.removeFavoriteForArticle = exports.removeFavoriteForProduct = exports.toggleFavoriteForArticle = exports.toggleFavoriteForProduct = exports.FavoriteController = void 0;
const favorite_service_1 = require("../services/favorite.service");
class FavoriteController {
    constructor() {
        this.toggleFavoriteForProduct = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId } = req.params;
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ message: "로그인이 필요합니다." });
                    return;
                }
                const result = yield this.favoriteService.toggleProductFavorite(Number(productId), userId);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.toggleFavoriteForArticle = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { articleId } = req.params;
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ message: "로그인이 필요합니다." });
                    return;
                }
                const result = yield this.favoriteService.toggleArticleFavorite(Number(articleId), userId);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.removeFavoriteForProduct = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId } = req.params;
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ message: "로그인이 필요합니다." });
                    return;
                }
                const result = yield this.favoriteService.removeProductFavorite(Number(productId), userId);
                res.status(200).json({
                    message: "좋아요가 삭제되었습니다.",
                    favoriteCount: result.favoriteCount,
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.removeFavoriteForArticle = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { articleId } = req.params;
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ message: "로그인이 필요합니다." });
                    return;
                }
                yield this.favoriteService.removeArticleFavorite(Number(articleId), userId);
                res.status(204).send();
            }
            catch (error) {
                next(error);
            }
        });
        this.favoriteService = new favorite_service_1.FavoriteService();
    }
}
exports.FavoriteController = FavoriteController;
// 컨트롤러 인스턴스 생성
const favoriteController = new FavoriteController();
// 컨트롤러 메서드 export
exports.toggleFavoriteForProduct = favoriteController.toggleFavoriteForProduct, exports.toggleFavoriteForArticle = favoriteController.toggleFavoriteForArticle, exports.removeFavoriteForProduct = favoriteController.removeFavoriteForProduct, exports.removeFavoriteForArticle = favoriteController.removeFavoriteForArticle;
//# sourceMappingURL=favorite.controller.js.map