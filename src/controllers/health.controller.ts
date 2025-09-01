import { Request, Response, NextFunction } from "express";
import { HealthService } from "../services/health.service";

/**
 * 헬스 체크 컨트롤러
 * 시스템 모니터링을 위한 다양한 헬스 체크 엔드포인트를 제공합니다.
 */
export class HealthController {
  private static healthService = new HealthService();

  /**
   * 기본 헬스체크 엔드포인트
   */
  static async basicHealthCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const healthData = await HealthController.healthService.getBasicHealth();
      const statusCode = healthData.status === "ok" ? 200 : 503;
      res.status(statusCode).json(healthData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 상세 헬스체크 엔드포인트
   */
  static async detailedHealthCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const healthData = await HealthController.healthService.getDetailedHealth();
      res.status(200).json(healthData);
    } catch (error) {
      res.status(503).json({
        status: "error",
        message: error instanceof Error ? error.message : "상세 헬스체크 중 오류가 발생했습니다",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * DB 헬스체크 엔드포인트 (실제 DB 연결 확인)
   */
  static async databaseHealthCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const healthData = await HealthController.healthService.getDatabaseHealth();
      const statusCode = healthData.status === "ok" ? 200 : 503;
      res.status(statusCode).json(healthData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 준비성 체크 엔드포인트 (Readiness Probe)
   */
  static async readinessCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const healthData = await HealthController.healthService.getReadinessCheck();
      const statusCode = healthData.status === "ready" ? 200 : 503;
      res.status(statusCode).json(healthData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 생존성 체크 엔드포인트 (Liveness Probe)
   */
  static async livenessCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const healthData = await HealthController.healthService.getLivenessCheck();
      const statusCode = healthData.status === "alive" ? 200 : 503;
      res.status(statusCode).json(healthData);
    } catch (error) {
      next(error);
    }
  }
}
