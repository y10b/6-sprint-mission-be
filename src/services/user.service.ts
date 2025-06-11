import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { BadRequestError, NotFoundError } from "../utils/customError";

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    nickname: string;
  };
}

export class UserService {
  private prisma: PrismaClient;
  private readonly jwtSecret: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.jwtSecret = process.env.JWT_SECRET || "your-secret-key";
  }

  async register(
    email: string,
    encryptedPassword: string,
    nickname: string
  ): Promise<Omit<User, "encryptedPassword" | "refreshToken">> {
    // 이메일 중복 확인
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new BadRequestError("이미 사용 중인 이메일입니다.");
    }

    // 닉네임 중복 확인
    const existingNickname = await this.prisma.user.findUnique({
      where: { nickname },
    });

    if (existingNickname) {
      throw new BadRequestError("이미 사용 중인 닉네임입니다.");
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(encryptedPassword, 10);

    // 사용자 생성
    const user = await this.prisma.user.create({
      data: {
        email,
        encryptedPassword: hashedPassword,
        nickname,
        refreshToken: null,
      },
    });

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async login(email: string, encryptedPassword: string): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundError("사용자를 찾을 수 없습니다.");
    }

    const isPasswordValid = await bcrypt.compare(
      encryptedPassword,
      user.encryptedPassword
    );

    if (!isPasswordValid) {
      throw new BadRequestError("비밀번호가 일치하지 않습니다.");
    }

    const accessToken = jwt.sign({ userId: user.id }, this.jwtSecret, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ userId: user.id }, this.jwtSecret, {
      expiresIn: "7d",
    });

    // refreshToken 업데이트
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      },
    };
  }

  async getProfile(
    userId: number
  ): Promise<Omit<User, "encryptedPassword" | "refreshToken">> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("사용자를 찾을 수 없습니다.");
    }

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
