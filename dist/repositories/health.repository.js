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
exports.HealthRepository = void 0;
const prisma_1 = require("../db/prisma");
/**
 * 헬스 체크 레포지토리
 * 데이터베이스 연결 상태 확인을 담당합니다.
 */
class HealthRepository {
    /**
     * 데이터베이스 연결 상태를 확인합니다.
     */
    checkDatabaseConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            try {
                // 단순한 연결 테스트
                yield prisma_1.prisma.$queryRaw `SELECT 1`;
                // 데이터베이스 정보 조회
                const dbInfo = yield this.getDatabaseInfo();
                return {
                    status: "connected",
                    type: "postgresql",
                    database: ((_a = dbInfo[0]) === null || _a === void 0 ? void 0 : _a.current_database) || "unknown",
                    version: ((_c = (_b = dbInfo[0]) === null || _b === void 0 ? void 0 : _b.version) === null || _c === void 0 ? void 0 : _c.split(",")[0]) || "unknown",
                    host: ((_e = (_d = process.env.DATABASE_URL) === null || _d === void 0 ? void 0 : _d.split("@")[1]) === null || _e === void 0 ? void 0 : _e.split(":")[0]) || "unknown",
                    port: 5432,
                };
            }
            catch (error) {
                return {
                    status: "disconnected",
                    error: error instanceof Error ? error.message : "Unknown error",
                };
            }
        });
    }
    /**
     * 데이터베이스 기본 정보를 조회합니다.
     */
    getDatabaseInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield prisma_1.prisma.$queryRaw `SELECT current_database(), version()`);
        });
    }
}
exports.HealthRepository = HealthRepository;
//# sourceMappingURL=health.repository.js.map