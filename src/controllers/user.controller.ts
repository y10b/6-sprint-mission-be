import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient, User } from "@prisma/client";
import { BadRequestError, ConflictError } from "../utils/customError";
import { UserService } from "../services/user.service";

const prisma = new PrismaClient();

const ACCESS_SECRET = process.env.JWT_SECRET || "your-secret-key";
const REFRESH_SECRET = process.env.JWT_SECRET || "your-secret-key";

const createAccessToken = (user: User): string =>
  jwt.sign({ userId: user.id }, ACCESS_SECRET, { expiresIn: "15m" });

const createRefreshToken = (user: User): string =>
  jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: "7d" });

interface RegisterUserBody {
  email: string;
  encryptedPassword: string;
  nickname: string;
}

interface LoginUserBody {
  email: string;
  encryptedPassword: string;
}

const userService = new UserService();

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, encryptedPassword, nickname } = req.body;
    const user = await userService.register(email, encryptedPassword, nickname);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("🔐 [loginUser] 로그인 요청 시작");
    const { email, encryptedPassword } = req.body;
    console.log("📧 [loginUser] 이메일:", email);

    const { user } = await userService.login(email, encryptedPassword);
    console.log("👤 [loginUser] 로그인 성공, 사용자 ID:", user.id);

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    console.log("🔑 [loginUser] 토큰 생성 완료");

    // refreshToken을 데이터베이스에 저장
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });
    console.log("💾 [loginUser] DB에 리프레시 토큰 저장 완료");

    const isProduction = process.env.NODE_ENV === "production";
    console.log("🌍 [loginUser] 환경:", isProduction ? "프로덕션" : "개발");

    // 환경에 따른 쿠키 설정
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ("none" as const) : ("lax" as const),
    };
    console.log("🍪 [loginUser] 쿠키 옵션:", cookieOptions);

    // refreshToken을 httpOnly 쿠키로 설정
    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });
    console.log("🍪 [loginUser] refreshToken 쿠키 설정 완료");

    // accessToken도 httpOnly 쿠키로 설정
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15분
    });
    console.log("🍪 [loginUser] accessToken 쿠키 설정 완료");

    // 응답에는 민감하지 않은 사용자 정보만 포함
    const { encryptedPassword: _, refreshToken: __, ...safeUserInfo } = user;

    console.log("✅ [loginUser] 로그인 응답 전송");
    res.json({ user: safeUserInfo });
  } catch (error) {
    console.error("❌ [loginUser] 로그인 에러:", error);
    next(error);
  }
};

export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "로그인이 필요합니다." });
      return;
    }

    const user = await userService.getProfile(userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "로그인이 필요합니다." });
      return;
    }

    // 데이터베이스에서 refreshToken 제거
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    const isProduction = process.env.NODE_ENV === "production";

    // 로그인 시와 동일한 쿠키 설정 사용
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ("none" as const) : ("lax" as const),
    };

    // 쿠키 제거
    res.clearCookie("refreshToken", cookieOptions);
    res.clearCookie("accessToken", cookieOptions);

    res.json({ message: "로그아웃되었습니다." });
  } catch (error) {
    next(error);
  }
};
