import { Request, Response } from "express";
import os from "os";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class HealthController {
  // 기본 헬스체크
  static async basicHealthCheck(req: Request, res: Response) {
    try {
      res.status(200).json({
        status: "ok",
        message: "서버가 정상적으로 동작 중입니다",
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV || "development",
      });
    } catch (error) {
      res.status(503).json({
        status: "error",
        message: "서버에 문제가 발생했습니다",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // 상세 헬스체크
  static async detailedHealthCheck(req: Request, res: Response) {
    try {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      const healthData = {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV || "development",
        version: process.env.npm_package_version || "1.0.0",
        server: {
          platform: os.platform(),
          arch: os.arch(),
          hostname: os.hostname(),
          release: os.release(),
          nodeVersion: process.version,
        },
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
          systemFree: `${Math.round(os.freemem() / 1024 / 1024)}MB`,
          systemTotal: `${Math.round(os.totalmem() / 1024 / 1024)}MB`,
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
          loadAverage: os.loadavg(),
          cores: os.cpus().length,
        },
        database: {
          status: "not_checked", // DB 연결 확인 시 업데이트
        },
      };

      res.status(200).json(healthData);
    } catch (error) {
      res.status(503).json({
        status: "error",
        message: "상세 헬스체크 중 오류가 발생했습니다",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // DB 헬스체크 (실제 DB 연결 확인)
  static async databaseHealthCheck(req: Request, res: Response) {
    try {
      // 실제 Prisma DB 연결 확인
      await prisma.$queryRaw`SELECT 1`;
      const dbInfo =
        (await prisma.$queryRaw`SELECT current_database(), version()`) as any;

      res.status(200).json({
        status: "ok",
        database: {
          status: "connected",
          type: "postgresql",
          database: dbInfo[0]?.current_database || "unknown",
          version: dbInfo[0]?.version?.split(",")[0] || "unknown",
          host:
            process.env.DATABASE_URL?.split("@")[1]?.split(":")[0] || "unknown",
          port: 5432,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        status: "error",
        database: {
          status: "disconnected",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 준비성 체크 (Readiness Probe)
  static async readinessCheck(req: Request, res: Response) {
    try {
      // 서버가 요청을 처리할 준비가 되었는지 확인
      const isReady = true; // 실제 로직으로 대체

      if (isReady) {
        res.status(200).json({
          status: "ready",
          message: "서버가 요청을 처리할 준비가 되었습니다",
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(503).json({
          status: "not_ready",
          message: "서버가 아직 준비되지 않았습니다",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      res.status(503).json({
        status: "error",
        message: "준비성 체크 중 오류가 발생했습니다",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // 생존성 체크 (Liveness Probe)
  static async livenessCheck(req: Request, res: Response) {
    try {
      // 서버가 살아있는지 확인 (간단한 체크)
      res.status(200).json({
        status: "alive",
        message: "서버가 정상적으로 동작 중입니다",
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
      });
    } catch (error) {
      res.status(503).json({
        status: "error",
        message: "생존성 체크 중 오류가 발생했습니다",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
