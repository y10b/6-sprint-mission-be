import { THealthStatus, TDatabaseStatus } from "./express.d";

/**
 * 헬스 체크 관련 특화 타입 및 인터페이스 정의
 * (공통 타입은 express.d.ts에서 관리)
 */

// 기본 헬스 체크 응답 타입
export type TBasicHealthResponse = {
  status: THealthStatus;
  message: string;
  timestamp: string;
  uptime?: number;
  environment?: string;
  error?: string;
};

// 메모리 사용량 타입
export type TMemoryUsage = {
  rss: string;
  heapTotal: string;
  heapUsed: string;
  external: string;
  systemFree: string;
  systemTotal: string;
};

// CPU 사용량 타입
export type TCpuUsage = {
  user: number;
  system: number;
  loadAverage: number[];
  cores: number;
};

// 서버 정보 타입
export type TServerInfo = {
  platform: string;
  arch: string;
  hostname: string;
  release: string;
  nodeVersion: string;
};

// 데이터베이스 정보 타입
export type TDatabaseInfo = {
  status: TDatabaseStatus;
  type?: string;
  database?: string;
  version?: string;
  host?: string;
  port?: number;
  error?: string;
};

// 상세 헬스 체크 응답 타입
export type TDetailedHealthResponse = {
  status: THealthStatus;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  server: TServerInfo;
  memory: TMemoryUsage;
  cpu: TCpuUsage;
  database: TDatabaseInfo;
};

// 데이터베이스 헬스 체크 응답 타입
export type TDatabaseHealthResponse = {
  status: THealthStatus;
  database: TDatabaseInfo;
  timestamp: string;
};

// 헬스 체크 레포지토리 인터페이스
export interface IHealthRepository {
  checkDatabaseConnection(): Promise<TDatabaseInfo>;
  getDatabaseInfo(): Promise<{ current_database: string; version: string }[]>;
}

// 헬스 체크 서비스 인터페이스
export interface IHealthService {
  getBasicHealth(): Promise<TBasicHealthResponse>;
  getDetailedHealth(): Promise<TDetailedHealthResponse>;
  getDatabaseHealth(): Promise<TDatabaseHealthResponse>;
  getReadinessCheck(): Promise<TBasicHealthResponse>;
  getLivenessCheck(): Promise<TBasicHealthResponse>;
}
