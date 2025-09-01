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
exports.HealthController = void 0;
const health_service_1 = require("../services/health.service");
/**
 * 헬스 체크 컨트롤러
 * 시스템 모니터링을 위한 다양한 헬스 체크 엔드포인트를 제공합니다.
 */
class HealthController {
    /**
     * 기본 헬스체크 엔드포인트
     */
    static basicHealthCheck(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const healthData = yield HealthController.healthService.getBasicHealth();
                const statusCode = healthData.status === "ok" ? 200 : 503;
                res.status(statusCode).json(healthData);
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * 상세 헬스체크 엔드포인트
     */
    static detailedHealthCheck(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const healthData = yield HealthController.healthService.getDetailedHealth();
                res.status(200).json(healthData);
            }
            catch (error) {
                res.status(503).json({
                    status: "error",
                    message: error instanceof Error ? error.message : "상세 헬스체크 중 오류가 발생했습니다",
                    timestamp: new Date().toISOString(),
                });
            }
        });
    }
    /**
     * DB 헬스체크 엔드포인트 (실제 DB 연결 확인)
     */
    static databaseHealthCheck(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const healthData = yield HealthController.healthService.getDatabaseHealth();
                const statusCode = healthData.status === "ok" ? 200 : 503;
                res.status(statusCode).json(healthData);
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * 준비성 체크 엔드포인트 (Readiness Probe)
     */
    static readinessCheck(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const healthData = yield HealthController.healthService.getReadinessCheck();
                const statusCode = healthData.status === "ready" ? 200 : 503;
                res.status(statusCode).json(healthData);
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * 생존성 체크 엔드포인트 (Liveness Probe)
     */
    static livenessCheck(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const healthData = yield HealthController.healthService.getLivenessCheck();
                const statusCode = healthData.status === "alive" ? 200 : 503;
                res.status(statusCode).json(healthData);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.HealthController = HealthController;
HealthController.healthService = new health_service_1.HealthService();
//# sourceMappingURL=health.controller.js.map