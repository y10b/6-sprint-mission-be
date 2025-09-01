import { prisma } from "../db/prisma";
import { TDatabaseStatus } from "../types/express.d";
import { IHealthRepository, TDatabaseInfo } from "../types/health.types";

/**
 * 헬스 체크 레포지토리
 * 데이터베이스 연결 상태 확인을 담당합니다.
 */
export class HealthRepository implements IHealthRepository {
  /**
   * 데이터베이스 연결 상태를 확인합니다.
   */
  async checkDatabaseConnection(): Promise<TDatabaseInfo> {
    try {
      // 단순한 연결 테스트
      await prisma.$queryRaw`SELECT 1`;

      // 데이터베이스 정보 조회
      const dbInfo = await this.getDatabaseInfo();

      return {
        status: "connected",
        type: "postgresql",
        database: dbInfo[0]?.current_database || "unknown",
        version: dbInfo[0]?.version?.split(",")[0] || "unknown",
        host:
          process.env.DATABASE_URL?.split("@")[1]?.split(":")[0] || "unknown",
        port: 5432,
      };
    } catch (error) {
      return {
        status: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * 데이터베이스 기본 정보를 조회합니다.
   */
  async getDatabaseInfo(): Promise<
    { current_database: string; version: string }[]
  > {
    return (await prisma.$queryRaw`SELECT current_database(), version()`) as any;
  }
}
