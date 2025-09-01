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
exports.disconnectPrisma = exports.prisma = void 0;
const client_1 = require("@prisma/client");
/**
 * PrismaClient 인스턴스
 * Node.js 모듈 시스템을 활용하여 애플리케이션 전체에서 하나의 인스턴스를 공유합니다.
 */
exports.prisma = new client_1.PrismaClient({
    log: process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
});
/**
 * 애플리케이션 종료 시 DB 연결을 정리합니다.
 */
const disconnectPrisma = () => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.prisma.$disconnect();
});
exports.disconnectPrisma = disconnectPrisma;
//# sourceMappingURL=prisma.js.map