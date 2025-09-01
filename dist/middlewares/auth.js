"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const customError_1 = require("../utils/customError");
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your-secret-key");
    }
    catch (error) {
        console.error("Token verification error:", error);
        return null;
    }
};
const createAuthMiddleware = (required) => {
    return (req, res, next) => {
        const token = req.cookies.accessToken;
        if (!token) {
            if (required) {
                return next(new customError_1.UnauthorizedError("로그인이 필요합니다."));
            }
            return next();
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            if (required) {
                return next(new customError_1.UnauthorizedError("유효하지 않은 토큰입니다."));
            }
            return next();
        }
        req.user = {
            id: decoded.userId,
            email: "",
            nickname: "",
        };
        req.userId = decoded.userId;
        next();
    };
};
const authenticateToken = createAuthMiddleware(true);
exports.authenticateToken = authenticateToken;
authenticateToken.required = createAuthMiddleware(true);
authenticateToken.optional = createAuthMiddleware(false);
//# sourceMappingURL=auth.js.map