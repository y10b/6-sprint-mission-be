import { Express } from "express";
import { Request } from "express";

/**
 * 프로젝트 공통 타입 정의 파일
 * Express 타입 확장 및 전역 공통 타입들을 관리합니다.
 */

// =============================================================================
// Express 타입 확장
// =============================================================================
declare global {
  namespace Express {
    interface Request {
      userId?: TId;
      user?: TUserInfo;
    }
  }
}

// =============================================================================
// 공통 기본 타입
// =============================================================================

// ID 타입
export type TId = number;

// API 응답 타입
export type TApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

// 페이지네이션 타입
export type TPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// 정렬 옵션 타입
export type TSortOrder = "asc" | "desc";

// 날짜 범위 타입
export type TDateRange = {
  startDate: Date;
  endDate: Date;
};

// 에러 정보 타입
export type TErrorInfo = {
  code: string;
  message: string;
  details?: any;
};

// =============================================================================
// 인증 관련 공통 타입
// =============================================================================

// 토큰 타입
export type TAccessToken = string;
export type TRefreshToken = string;

// 토큰 페어 타입
export type TTokenPair = {
  accessToken: TAccessToken;
  refreshToken: TRefreshToken;
};

// JWT 페이로드 인터페이스
export interface IJwtPayload {
  id: TId;
  email?: string;
  nickname?: string;
}

// 토큰 응답 인터페이스
export interface ITokenResponse {
  message: string;
  accessToken: string;
}

// 쿠키 옵션 타입
export type TCookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "none" | "lax" | "strict";
  path: string;
  maxAge?: number;
  domain?: string;
};

// =============================================================================
// 사용자 관련 공통 타입
// =============================================================================

// Express Request에서 사용되는 사용자 정보 타입
export type TUserInfo = {
  id: TId;
  email: string;
  nickname: string;
};

// 사용자 등록 요청 타입
export type TRegisterUserBody = {
  email: string;
  encryptedPassword: string;
  nickname: string;
};

// 사용자 로그인 요청 타입
export type TLoginUserBody = {
  email: string;
  encryptedPassword: string;
};

// =============================================================================
// 헬스 체크 관련 공통 타입
// =============================================================================

// 헬스 체크 상태 타입
export type THealthStatus = "ok" | "error" | "not_ready" | "ready" | "alive";

// 데이터베이스 상태 타입
export type TDatabaseStatus = "connected" | "disconnected" | "not_checked";

export {};
