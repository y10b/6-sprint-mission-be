import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { ITokenResponse } from "../types/express.d";

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
    // 세션 유지 개선을 위한 쿠키 옵션 설정
    const cookieOptions = {
      httpOnly: true, // XSS 공격 방지
      secure: process.env.NODE_ENV === "production", // HTTPS에서만 전송 (프로덕션)
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 개발환경에서 lax 정책 사용
      maxAge: 60 * 60 * 1000, // 1시간 (토큰 만료시간과 일치)
      path: "/", // 모든 경로에서 접근 가능
      // 개발환경에서는 도메인 설정 제거 (localhost 호환성 확보)
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
