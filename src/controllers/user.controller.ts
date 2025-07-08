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
    const { email, encryptedPassword } = req.body;
    const { user } = await userService.login(email, encryptedPassword);

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    // refreshToken을 데이터베이스에 저장
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // refreshToken을 httpOnly 쿠키로 설정 - CloudFront HTTPS 지원
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // 프로덕션에서만 HTTPS 필요
      sameSite: "none", // 크로스 도메인 허용
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      ...(process.env.NODE_ENV === "production" && {
        domain: ".toieeeeeea.shop",
      }),
    });

    // accessToken도 httpOnly 쿠키로 설정 - CloudFront HTTPS 지원
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // 프로덕션에서만 HTTPS 필요
      sameSite: "none", // 크로스 도메인 허용
      maxAge: 15 * 60 * 1000, // 15분
      ...(process.env.NODE_ENV === "production" && {
        domain: ".toieeeeeea.shop",
      }),
    });

    // 응답에는 민감하지 않은 사용자 정보만 포함
    const { encryptedPassword: _, refreshToken: __, ...safeUserInfo } = user;
    res.json({ user: safeUserInfo });
  } catch (error) {
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

    // 쿠키 제거 - 크로스 도메인 설정과 동일하게
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      ...(process.env.NODE_ENV === "production" && {
        domain: ".toieeeeeea.shop",
      }),
    });
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      ...(process.env.NODE_ENV === "production" && {
        domain: ".toieeeeeea.shop",
      }),
    });

    res.json({ message: "로그아웃되었습니다." });
  } catch (error) {
    next(error);
  }
};
