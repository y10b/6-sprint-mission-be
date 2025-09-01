import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { UserService } from "../services/user.service";
import {
  TRegisterUserBody,
  TLoginUserBody,
  TAccessToken,
  TRefreshToken,
  TCookieOptions,
} from "../types/express.d";

/**
 * JWT 토큰 생성 유틸리티
 */
const ACCESS_SECRET = process.env.JWT_SECRET || "";
const REFRESH_SECRET = process.env.JWT_SECRET || "";

const createAccessToken = (user: User): TAccessToken =>
  jwt.sign({ userId: user.id }, ACCESS_SECRET, { expiresIn: "15m" });

const createRefreshToken = (user: User): TRefreshToken =>
  jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: "7d" });

/**
 * 쿠키 옵션 생성 유틸리티
 */
const getCookieOptions = (): TCookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
});

const userService = new UserService();

/**
 * 사용자 등록 컨트롤러
 */
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, encryptedPassword, nickname }: TRegisterUserBody = req.body;
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
    const { email, encryptedPassword }: TLoginUserBody = req.body;
    const { user } = await userService.login(email, encryptedPassword);

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    // refreshToken을 데이터베이스에 저장 (서비스 계층을 통해)
    await userService.updateRefreshToken(user.id, refreshToken);

    // 쿠키 옵션 설정
    const cookieOptions = getCookieOptions();

    // refreshToken을 httpOnly 쿠키로 설정
    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

    // accessToken도 httpOnly 쿠키로 설정
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15분
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

    // 데이터베이스에서 refreshToken 제거 (서비스 계층을 통해)
    await userService.updateRefreshToken(userId, null);

    // 쿠키 제거 옵션 설정
    const clearCookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,
      ...(process.env.NODE_ENV === "production" && {
        domain: ".toieeeeeea.shop",
      }),
    };

    // 쿠키 제거
    res.clearCookie("refreshToken", clearCookieOptions);
    res.clearCookie("accessToken", clearCookieOptions);

    res.json({ message: "로그아웃되었습니다." });
  } catch (error) {
    next(error);
  }
};
