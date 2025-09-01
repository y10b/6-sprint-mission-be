import { User } from "@prisma/client";
import { TId } from "./express.d";

/**
 * 사용자 관련 특화 타입 및 인터페이스 정의
 * (공통 타입은 express.d.ts에서 관리)
 */

// 안전한 사용자 정보 타입 (민감한 정보 제외)
export type TSafeUser = Omit<User, "encryptedPassword" | "refreshToken">;

// 사용자 프로필 타입
export type TUserProfile = Pick<
  User,
  "id" | "email" | "nickname" | "image" | "createdAt" | "updatedAt"
>;

// 인증 응답 인터페이스
export interface IAuthResponse {
  user: User;
}

// 사용자 레포지토리 인터페이스
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findByNickname(nickname: string): Promise<User | null>;
  findById(id: TId): Promise<User | null>;
  create(data: TCreateUserData): Promise<User>;
  update(id: TId, data: TUpdateUserData): Promise<User>;
  findByIdWithProfile(id: TId): Promise<TUserProfile | null>;
  updateRefreshToken(id: TId, refreshToken: string | null): Promise<User>;
}

// 사용자 서비스 인터페이스
export interface IUserService {
  register(
    email: string,
    encryptedPassword: string,
    nickname: string
  ): Promise<TSafeUser>;
  login(email: string, encryptedPassword: string): Promise<IAuthResponse>;
  getProfile(userId: TId): Promise<TSafeUser>;
  updateRefreshToken(userId: TId, refreshToken: string | null): Promise<void>;
}

// 사용자 생성 데이터 타입
export type TCreateUserData = {
  email: string;
  encryptedPassword: string;
  nickname: string;
  refreshToken?: string | null;
};

// 사용자 업데이트 데이터 타입
export type TUpdateUserData = {
  email?: string;
  encryptedPassword?: string;
  nickname?: string;
  image?: string | null;
  refreshToken?: string | null;
};
