import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { TokenResponse } from "../types/auth.types";

const authService = new AuthService();

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      error: "인증 오류",
      message: "리프레시 토큰이 필요합니다.",
    });
    return;
  }

  try {
    const newAccessToken = await authService.refreshAccessToken(refreshToken);

    // 개발/프로덕션 환경에 따른 쿠키 설정
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15분
      // domain 설정을 제거하여 크로스 도메인 쿠키 문제 해결
    } as const;

    // 새로운 액세스 토큰을 쿠키에 설정
    res.cookie("accessToken", newAccessToken, cookieOptions);

    res.json({
      success: true,
      message: "액세스 토큰이 갱신되었습니다.",
    });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(403).json({
      success: false,
      error: "인증 오류",
      message:
        error instanceof Error
          ? error.message
          : "토큰이 만료되었거나 유효하지 않습니다.",
    });
  }
};
