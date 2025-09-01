import { PrismaClient } from "@prisma/client";

/**
 * PrismaClient 인스턴스
 * Node.js 모듈 시스템을 활용하여 애플리케이션 전체에서 하나의 인스턴스를 공유합니다.
 */
export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});

/**
 * 애플리케이션 종료 시 DB 연결을 정리합니다.
 */
export const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
};
