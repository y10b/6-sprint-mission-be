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
exports.HealthService = void 0;
const os_1 = __importDefault(require("os"));
const health_repository_1 = require("../repositories/health.repository");
/**
 * 헬스 체크 서비스
 * 시스템 상태 모니터링을 위한 다양한 헬스 체크 기능을 제공합니다.
 */
class HealthService {
    constructor() {
        this.healthRepository = new health_repository_1.HealthRepository();
    }
    /**
     * 기본 헬스 체크 정보를 반환합니다.
     */
    getBasicHealth() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return {
                    status: "ok",
                    message: "서버가 정상적으로 동작 중입니다",
                    timestamp: new Date().toISOString(),
                    uptime: Math.floor(process.uptime()),
                    environment: process.env.NODE_ENV || "development",
                };
            }
            catch (error) {
                return {
                    status: "error",
                    message: "서버에 문제가 발생했습니다",
                    timestamp: new Date().toISOString(),
                    error: error instanceof Error ? error.message : "Unknown error",
                };
            }
        });
    }
    /**
     * 상세 헬스 체크 정보를 반환합니다.
     */
    getDetailedHealth() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const memoryUsage = process.memoryUsage();
                const cpuUsage = process.cpuUsage();
                const memory = {
                    rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
                    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
                    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
                    external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
                    systemFree: `${Math.round(os_1.default.freemem() / 1024 / 1024)}MB`,
                    systemTotal: `${Math.round(os_1.default.totalmem() / 1024 / 1024)}MB`,
                };
                const cpu = {
                    user: cpuUsage.user,
                    system: cpuUsage.system,
                    loadAverage: os_1.default.loadavg(),
                    cores: os_1.default.cpus().length,
                };
                const server = {
                    platform: os_1.default.platform(),
                    arch: os_1.default.arch(),
                    hostname: os_1.default.hostname(),
                    release: os_1.default.release(),
                    nodeVersion: process.version,
                };
                return {
                    status: "ok",
                    timestamp: new Date().toISOString(),
                    uptime: Math.floor(process.uptime()),
                    environment: process.env.NODE_ENV || "development",
                    version: process.env.npm_package_version || "1.0.0",
                    server,
                    memory,
                    cpu,
                    database: {
                        status: "not_checked", // 별도 API에서 확인
                    },
                };
            }
            catch (error) {
                throw new Error(`상세 헬스체크 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        });
    }
    /**
     * 데이터베이스 헬스 체크 정보를 반환합니다.
     */
    getDatabaseHealth() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const databaseInfo = yield this.healthRepository.checkDatabaseConnection();
                return {
                    status: "ok",
                    database: databaseInfo,
                    timestamp: new Date().toISOString(),
                };
            }
            catch (error) {
                return {
                    status: "error",
                    database: {
                        status: "disconnected",
                        error: error instanceof Error ? error.message : "Unknown error",
                    },
                    timestamp: new Date().toISOString(),
                };
            }
        });
    }
    /**
     * 준비성 체크 (Readiness Probe)를 수행합니다.
     */
    getReadinessCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 서버가 요청을 처리할 준비가 되었는지 확인
                const isReady = true; // 실제 준비 상태 확인 로직 구현 필요
                if (isReady) {
                    return {
                        status: "ready",
                        message: "서버가 요청을 처리할 준비가 되었습니다",
                        timestamp: new Date().toISOString(),
                    };
                }
                else {
                    return {
                        status: "not_ready",
                        message: "서버가 아직 준비되지 않았습니다",
                        timestamp: new Date().toISOString(),
                    };
                }
            }
            catch (error) {
                return {
                    status: "error",
                    message: "준비성 체크 중 오류가 발생했습니다",
                    timestamp: new Date().toISOString(),
                    error: error instanceof Error ? error.message : "Unknown error",
                };
            }
        });
    }
    /**
     * 생존성 체크 (Liveness Probe)를 수행합니다.
     */
    getLivenessCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return {
                    status: "alive",
                    message: "서버가 정상적으로 동작 중입니다",
                    timestamp: new Date().toISOString(),
                    uptime: Math.floor(process.uptime()),
                };
            }
            catch (error) {
                return {
                    status: "error",
                    message: "생존성 체크 중 오류가 발생했습니다",
                    timestamp: new Date().toISOString(),
                    error: error instanceof Error ? error.message : "Unknown error",
                };
            }
        });
    }
}
exports.HealthService = HealthService;
//# sourceMappingURL=health.service.js.map