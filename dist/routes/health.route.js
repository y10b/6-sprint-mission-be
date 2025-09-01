"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/health.js
const express_1 = require("express");
const health_controller_1 = require("../controllers/health.controller");
const healthRouter = (0, express_1.Router)();
// 기본 헬스체크 - GET 서버 헬스 체크
healthRouter.get("/", health_controller_1.HealthController.basicHealthCheck);
// 상세 헬스체크 - GET 서버 사용량 체크
healthRouter.get("/detailed", health_controller_1.HealthController.detailedHealthCheck);
// DB 헬스체크 - GET DB 헬스 체크
healthRouter.get("/db", health_controller_1.HealthController.databaseHealthCheck);
// 준비성 체크 트래픽을 받을 준비 체크
healthRouter.get("/ready", health_controller_1.HealthController.readinessCheck);
// 생존성 체크 서버 생존 체크
healthRouter.get("/live", health_controller_1.HealthController.livenessCheck);
exports.default = healthRouter;
//# sourceMappingURL=health.route.js.map