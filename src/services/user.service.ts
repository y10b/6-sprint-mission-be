import bcrypt from "bcrypt";
import { BadRequestError, NotFoundError } from "../utils/customError";
import { UserRepository } from "../repositories/user.repository";
import { TId } from "../types/express.d";
import { IUserService, IAuthResponse, TSafeUser } from "../types/user.types";

/**
 * 사용자 서비스
 * 사용자 관련 비즈니스 로직을 처리합니다.
 */
export class UserService implements IUserService {
  private userRepository: UserRepository;
  private readonly jwtSecret: string;

  constructor() {
    this.userRepository = new UserRepository();
    this.jwtSecret = process.env.JWT_SECRET || "your-secret-key";
  }

  /**
   * 새로운 사용자를 등록합니다.
   */
  async register(
    email: string,
    encryptedPassword: string,
    nickname: string
  ): Promise<TSafeUser> {
    // 이메일 중복 확인
    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) {
      throw new BadRequestError("이미 사용 중인 이메일입니다.");
    }

    // 닉네임 중복 확인
    const existingNickname = await this.userRepository.findByNickname(nickname);
    if (existingNickname) {
      throw new BadRequestError("이미 사용 중인 닉네임입니다.");
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(encryptedPassword, 10);

    // 사용자 생성
    const user = await this.userRepository.create({
      email,
      encryptedPassword: hashedPassword,
      nickname,
      refreshToken: null,
    });

    // 민감한 정보 제거 후 반환
    const { encryptedPassword: _, refreshToken: __, ...safeUser } = user;
    return safeUser;
  }

  /**
   * 사용자 로그인을 처리합니다.
   */
  async login(
    email: string,
    encryptedPassword: string
  ): Promise<IAuthResponse> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestError("이메일 또는 비밀번호가 일치하지 않습니다.");
    }

    const isPasswordValid = await bcrypt.compare(
      encryptedPassword,
      user.encryptedPassword
    );

    if (!isPasswordValid) {
      throw new BadRequestError("이메일 또는 비밀번호가 일치하지 않습니다.");
    }

    return { user };
  }

  /**
   * 사용자 프로필 정보를 조회합니다.
   */
  async getProfile(userId: TId): Promise<TSafeUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("사용자를 찾을 수 없습니다.");
    }

    // 민감한 정보 제거 후 반환
    const { encryptedPassword: _, refreshToken: __, ...safeUser } = user;
    return safeUser;
  }

  /**
   * 사용자의 리프레시 토큰을 업데이트합니다.
   */
  async updateRefreshToken(
    userId: TId,
    refreshToken: string | null
  ): Promise<void> {
    await this.userRepository.updateRefreshToken(userId, refreshToken);
  }
}
