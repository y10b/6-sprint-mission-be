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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.getMyProfile = exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_service_1 = require("../services/user.service");
/**
 * JWT 토큰 생성 유틸리티
 */
const ACCESS_SECRET = process.env.JWT_SECRET || "";
const REFRESH_SECRET = process.env.JWT_SECRET || "";
const createAccessToken = (user) => jsonwebtoken_1.default.sign({ userId: user.id }, ACCESS_SECRET, { expiresIn: "15m" });
const createRefreshToken = (user) => jsonwebtoken_1.default.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: "7d" });
/**
 * 쿠키 옵션 생성 유틸리티
 */
const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
});
const userService = new user_service_1.UserService();
/**
 * 사용자 등록 컨트롤러
 */
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, encryptedPassword, nickname } = req.body;
        const user = yield userService.register(email, encryptedPassword, nickname);
        res.status(201).json(user);
    }
    catch (error) {
        next(error);
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, encryptedPassword } = req.body;
        const { user } = yield userService.login(email, encryptedPassword);
        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);
        // refreshToken을 데이터베이스에 저장 (서비스 계층을 통해)
        yield userService.updateRefreshToken(user.id, refreshToken);
        // 쿠키 옵션 설정
        const cookieOptions = getCookieOptions();
        // refreshToken을 httpOnly 쿠키로 설정
        res.cookie("refreshToken", refreshToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: 7 * 24 * 60 * 60 * 1000 }));
        // accessToken도 httpOnly 쿠키로 설정
        res.cookie("accessToken", accessToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: 15 * 60 * 1000 }));
        // 응답에는 민감하지 않은 사용자 정보만 포함
        const { encryptedPassword: _, refreshToken: __ } = user, safeUserInfo = __rest(user, ["encryptedPassword", "refreshToken"]);
        res.json({ user: safeUserInfo });
    }
    catch (error) {
        next(error);
    }
});
exports.loginUser = loginUser;
const getMyProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: "로그인이 필요합니다." });
            return;
        }
        const user = yield userService.getProfile(userId);
        res.json(user);
    }
    catch (error) {
        next(error);
    }
});
exports.getMyProfile = getMyProfile;
const logoutUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: "로그인이 필요합니다." });
            return;
        }
        // 데이터베이스에서 refreshToken 제거 (서비스 계층을 통해)
        yield userService.updateRefreshToken(userId, null);
        // 쿠키 제거 옵션 설정
        const clearCookieOptions = Object.assign({ httpOnly: true, secure: true, sameSite: "none" }, (process.env.NODE_ENV === "production" && {
            domain: ".toieeeeeea.shop",
        }));
        // 쿠키 제거
        res.clearCookie("refreshToken", clearCookieOptions);
        res.clearCookie("accessToken", clearCookieOptions);
        res.json({ message: "로그아웃되었습니다." });
    }
    catch (error) {
        next(error);
    }
});
exports.logoutUser = logoutUser;
//# sourceMappingURL=user.controller.js.map