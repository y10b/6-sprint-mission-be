// routes/health.js
import { Router } from "express";
import { HealthController } from "../controllers/health.controller";

const healthRouter = Router();

// 기본 헬스체크 - GET 서버 헬스 체크
healthRouter.get("/", HealthController.basicHealthCheck);

// 상세 헬스체크 - GET 서버 사용량 체크
healthRouter.get("/detailed", HealthController.detailedHealthCheck);

// DB 헬스체크 - GET DB 헬스 체크
healthRouter.get("/db", HealthController.databaseHealthCheck);

// 준비성 체크 트래픽을 받을 준비 체크
healthRouter.get("/ready", HealthController.readinessCheck);

// 생존성 체크 서버 생존 체크
healthRouter.get("/live", HealthController.livenessCheck);

export default healthRouter;
