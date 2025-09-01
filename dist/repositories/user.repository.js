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
exports.UserRepository = void 0;
const prisma_1 = require("../db/prisma");
/**
 * 사용자 레포지토리
 * 사용자 데이터베이스 접근을 담당합니다.
 */
class UserRepository {
    /**
     * 이메일로 사용자를 조회합니다.
     */
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.user.findUnique({
                where: { email },
            });
        });
    }
    /**
     * 닉네임으로 사용자를 조회합니다.
     */
    findByNickname(nickname) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.user.findUnique({
                where: { nickname },
            });
        });
    }
    /**
     * ID로 사용자를 조회합니다.
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.user.findUnique({
                where: { id },
            });
        });
    }
    /**
     * 새로운 사용자를 생성합니다.
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.user.create({
                data,
            });
        });
    }
    /**
     * 사용자 정보를 업데이트합니다.
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.user.update({
                where: { id },
                data,
            });
        });
    }
    /**
     * ID로 사용자 프로필 정보를 조회합니다.
     */
    findByIdWithProfile(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    email: true,
                    nickname: true,
                    image: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
        });
    }
    /**
     * 사용자의 리프레시 토큰을 업데이트합니다.
     */
    updateRefreshToken(id, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.user.update({
                where: { id },
                data: { refreshToken },
            });
        });
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.repository.js.map