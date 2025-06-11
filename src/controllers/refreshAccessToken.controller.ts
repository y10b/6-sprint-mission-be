import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { TokenResponse } from "../types/auth.types";

const authService = new AuthService();

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // 쿠키 또는 요청 본문에서 리프레시 토큰 가져오기
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

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

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
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
