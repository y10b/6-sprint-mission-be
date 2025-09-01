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
exports.ArticleService = void 0;
const article_repository_1 = require("../repositories/article.repository");
const customError_1 = require("../utils/customError");
class ArticleService {
    constructor() {
        this.articleRepository = new article_repository_1.ArticleRepository();
    }
    getAllArticles(page, limit, sort, keyword, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            // 정렬 조건 설정
            let orderBy;
            if (sort === "likes") {
                orderBy = {
                    likes: {
                        _count: "desc",
                    },
                };
            }
            else {
                orderBy = { createdAt: "desc" }; // 최신순 (기본)
            }
            const [totalCount, articles] = yield this.articleRepository.findAll(skip, limit, keyword, orderBy);
            const articlesWithDetails = yield Promise.all(articles.map((article) => __awaiter(this, void 0, void 0, function* () {
                const isLiked = userId
                    ? !!(yield this.articleRepository.checkLikeStatus(article.id, userId))
                    : false;
                const { _count, author } = article, rest = __rest(article, ["_count", "author"]);
                return Object.assign(Object.assign({}, rest), { authorNickname: author.nickname, likeCount: _count.likes, isLiked });
            })));
            return {
                articles: articlesWithDetails,
                totalCount,
            };
        });
    }
    getArticle(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const article = yield this.articleRepository.findById(id);
            if (!article) {
                throw new customError_1.NotFoundError("게시글을 찾을 수 없습니다.");
            }
            const isLiked = userId
                ? !!(yield this.articleRepository.checkLikeStatus(id, userId))
                : false;
            const { _count, author } = article, rest = __rest(article, ["_count", "author"]);
            return Object.assign(Object.assign({}, rest), { authorNickname: author.nickname, likeCount: _count.likes, isLiked });
        });
    }
    createArticle(authorId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data.title || !data.content) {
                throw new customError_1.BadRequestError("제목과 내용을 모두 입력해주세요.");
            }
            const article = yield this.articleRepository.create(data, authorId);
            return Object.assign(Object.assign({}, article), { authorNickname: article.author.nickname, likeCount: 0, isLiked: false });
        });
    }
    updateArticle(id, authorId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const article = yield this.articleRepository.findById(id);
            if (!article) {
                throw new customError_1.NotFoundError("게시글을 찾을 수 없습니다.");
            }
            if (article.authorId !== authorId) {
                throw new customError_1.ForbiddenError("본인의 게시글만 수정할 수 있습니다.");
            }
            const updatedArticle = yield this.articleRepository.update(id, data);
            return Object.assign(Object.assign({}, updatedArticle), { authorNickname: updatedArticle.author.nickname, likeCount: 0, isLiked: false });
        });
    }
    deleteArticle(id, authorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const article = yield this.articleRepository.findById(id);
            if (!article) {
                throw new customError_1.NotFoundError("게시글을 찾을 수 없습니다.");
            }
            if (article.authorId !== authorId) {
                throw new customError_1.ForbiddenError("본인의 게시글만 삭제할 수 있습니다.");
            }
            yield this.articleRepository.delete(id);
        });
    }
}
exports.ArticleService = ArticleService;
//# sourceMappingURL=article.service.js.map