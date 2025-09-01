import { User } from "@prisma/client";
import { prisma } from "../db/prisma";
import { TId } from "../types/express.d";
import {
  IUserRepository,
  TCreateUserData,
  TUpdateUserData,
  TUserProfile,
} from "../types/user.types";

/**
 * 사용자 레포지토리
 * 사용자 데이터베이스 접근을 담당합니다.
 */
export class UserRepository implements IUserRepository {
  /**
   * 이메일로 사용자를 조회합니다.
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * 닉네임으로 사용자를 조회합니다.
   */
  async findByNickname(nickname: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { nickname },
    });
  }

  /**
   * ID로 사용자를 조회합니다.
   */
  async findById(id: TId): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * 새로운 사용자를 생성합니다.
   */
  async create(data: TCreateUserData): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  /**
   * 사용자 정보를 업데이트합니다.
   */
  async update(id: TId, data: TUpdateUserData): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * ID로 사용자 프로필 정보를 조회합니다.
   */
  async findByIdWithProfile(id: TId): Promise<TUserProfile | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nickname: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * 사용자의 리프레시 토큰을 업데이트합니다.
   */
  async updateRefreshToken(
    id: TId,
    refreshToken: string | null
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  }
}
