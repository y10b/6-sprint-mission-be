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
exports.CommentRepository = void 0;
const prisma_1 = require("../db/prisma");
class CommentRepository {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.comment.create({
                data,
                include: {
                    user: { select: { id: true, nickname: true } },
                },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.comment.findUnique({
                where: { id },
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.comment.update({
                where: { id },
                data,
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.comment.delete({
                where: { id },
            });
        });
    }
    findProductComments(productId, limit, cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                where: { productId },
                include: {
                    user: { select: { id: true, nickname: true } },
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: limit,
            };
            if (cursor) {
                query.cursor = { id: cursor };
                query.skip = 1;
            }
            return prisma_1.prisma.comment.findMany(query);
        });
    }
}
exports.CommentRepository = CommentRepository;
//# sourceMappingURL=comment.repository.js.map