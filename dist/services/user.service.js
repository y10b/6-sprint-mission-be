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
exports.UserService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const customError_1 = require("../utils/customError");
const user_repository_1 = require("../repositories/user.repository");
/**
 * 사용자 서비스
 * 사용자 관련 비즈니스 로직을 처리합니다.
 */
class UserService {
    constructor() {
        this.userRepository = new user_repository_1.UserRepository();
        this.jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    }
    /**
     * 새로운 사용자를 등록합니다.
     */
    register(email, encryptedPassword, nickname) {
        return __awaiter(this, void 0, void 0, function* () {
            // 이메일 중복 확인
            const existingEmail = yield this.userRepository.findByEmail(email);
            if (existingEmail) {
                throw new customError_1.BadRequestError("이미 사용 중인 이메일입니다.");
            }
            // 닉네임 중복 확인
            const existingNickname = yield this.userRepository.findByNickname(nickname);
            if (existingNickname) {
                throw new customError_1.BadRequestError("이미 사용 중인 닉네임입니다.");
            }
            // 비밀번호 해시화
            const hashedPassword = yield bcrypt_1.default.hash(encryptedPassword, 10);
            // 사용자 생성
            const user = yield this.userRepository.create({
                email,
                encryptedPassword: hashedPassword,
                nickname,
                refreshToken: null,
            });
            // 민감한 정보 제거 후 반환
            const { encryptedPassword: _, refreshToken: __ } = user, safeUser = __rest(user, ["encryptedPassword", "refreshToken"]);
            return safeUser;
        });
    }
    /**
     * 사용자 로그인을 처리합니다.
     */
    login(email, encryptedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findByEmail(email);
            if (!user) {
                throw new customError_1.BadRequestError("이메일 또는 비밀번호가 일치하지 않습니다.");
            }
            const isPasswordValid = yield bcrypt_1.default.compare(encryptedPassword, user.encryptedPassword);
            if (!isPasswordValid) {
                throw new customError_1.BadRequestError("이메일 또는 비밀번호가 일치하지 않습니다.");
            }
            return { user };
        });
    }
    /**
     * 사용자 프로필 정보를 조회합니다.
     */
    getProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findById(userId);
            if (!user) {
                throw new customError_1.NotFoundError("사용자를 찾을 수 없습니다.");
            }
            // 민감한 정보 제거 후 반환
            const { encryptedPassword: _, refreshToken: __ } = user, safeUser = __rest(user, ["encryptedPassword", "refreshToken"]);
            return safeUser;
        });
    }
    /**
     * 사용자의 리프레시 토큰을 업데이트합니다.
     */
    updateRefreshToken(userId, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.userRepository.updateRefreshToken(userId, refreshToken);
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map