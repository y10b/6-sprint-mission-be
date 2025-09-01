"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAccessToken = void 0;
const auth_service_1 = require("../services/auth.service");
const authService = new auth_service_1.AuthService();
const refreshAccessToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const newAccessToken = yield authService.refreshAccessToken(refreshToken);
        // 개발/프로덕션 환경에 따른 쿠키 설정
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 15 * 60 * 1000, // 15분
            // domain 설정을 제거하여 크로스 도메인 쿠키 문제 해결
        };
        // 새로운 액세스 토큰을 쿠키에 설정
        res.cookie("accessToken", newAccessToken, cookieOptions);
        res.json({
            success: true,
            message: "액세스 토큰이 갱신되었습니다.",
        });
    }
    catch (error) {
        console.error("Refresh error:", error);
        res.status(403).json({
            success: false,
            error: "인증 오류",
            message: error instanceof Error
                ? error.message
                : "토큰이 만료되었거나 유효하지 않습니다.",
        });
    }
});
exports.refreshAccessToken = refreshAccessToken;
//# sourceMappingURL=refreshAccessToken.controller.js.map