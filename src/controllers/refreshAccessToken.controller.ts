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

    // 새로운 액세스 토큰을 쿠키에 설정 - CloudFront HTTPS 지원
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // 프로덕션에서만 HTTPS 필요
      sameSite: "none", // 크로스 도메인 허용
      maxAge: 15 * 60 * 1000, // 15분
      ...(process.env.NODE_ENV === "production" && {
        domain: ".toieeeeeea.shop",
      }),
    });

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
