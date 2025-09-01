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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../db/prisma");
const customError_1 = require("../utils/customError");
class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    }
    refreshAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = jsonwebtoken_1.default.verify(refreshToken, this.jwtSecret);
                const user = yield prisma_1.prisma.user.findUnique({
                    where: { id: payload.userId },
                });
                if (!user || user.refreshToken !== refreshToken) {
                    throw new customError_1.BadRequestError("유효하지 않은 리프레시 토큰입니다.");
                }
                const newAccessToken = jsonwebtoken_1.default.sign({ userId: user.id }, this.jwtSecret, {
                    expiresIn: "15m",
                });
                return newAccessToken;
            }
            catch (error) {
                if (error instanceof customError_1.BadRequestError) {
                    throw error;
                }
                throw new customError_1.BadRequestError("토큰이 만료되었거나 유효하지 않습니다.");
            }
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map