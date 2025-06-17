import userRepository from "../repositories/userRepository";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "@prisma/client";
import { CustomError } from "../utils/CustomError";

const JWT_SECRET_ENV = process.env.JWT_SECRET;
if (!JWT_SECRET_ENV) {
  throw new Error(
    "JWT_SECRET is not defined in environment variables. Please set it."
  );
}
const JWT_SECRET: string = JWT_SECRET_ENV;

const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

type SignUpUserData = Pick<User, "nickname" | "email"> & {
  password: User["password"];
  passwordConfirmation: string;
};

async function signUpUser({
  nickname,
  email,
  password,
  passwordConfirmation,
}: SignUpUserData): Promise<Omit<User, "password">> {
  if (password !== passwordConfirmation) {
    throw new CustomError(422, "비밀번호가 일치하지 않습니다.");
  }
  const existingUserByEmail = await userRepository.findByEmail(email);
  if (existingUserByEmail) {
    throw new CustomError(409, "이미 사용중인 이메일입니다.");
  }

  const existingUserByNickname = await userRepository.findByNickname(nickname);
  if (existingUserByNickname) {
    throw new CustomError(409, "이미 사용중인 닉네임입니다.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser: Omit<User, "password"> = await userRepository.create({
    nickname,
    email,
    password: hashedPassword,
  });

  return newUser;
}

type SignInResponse = {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, "password">;
};

async function signInUser(
  email: User["email"],
  passwordInput: User["password"]
): Promise<SignInResponse> {
  const user: User | null = await userRepository.findByEmail(email);
  if (!user) {
    throw new CustomError(401, "이메일 또는 비밀번호가 일치하지 않습니다.");
  }

  const isPasswordValid = await bcrypt.compare(passwordInput, user.password);
  if (!isPasswordValid) {
    throw new CustomError(401, "이메일 또는 비밀번호가 일치하지 않습니다.");
  }

  const payload = {
    userId: user.id,
    email: user.email,
    nickname: user.nickname,
  };

  const accessTokenOptions: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
  };
  const refreshTokenOptions: SignOptions = {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, accessTokenOptions);
  const refreshToken = jwt.sign(payload, JWT_SECRET, refreshTokenOptions);

  const { password: _, ...userWithoutPassword } = user;

  return { accessToken, refreshToken, user: userWithoutPassword };
}

export type TokenUserPayload = Pick<User, "id" | "email" | "nickname">;

function generateNewAccessToken(user: TokenUserPayload): string {
  if (!user || !user.id || !user.email || !user.nickname) {
    throw new CustomError(
      400,
      "새로운 액세스 토큰을 생성하기 위한 사용자 정보가 유효하지 않습니다."
    );
  }

  const payload = {
    userId: user.id,
    email: user.email,
    nickname: user.nickname,
  };

  const signOptions: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, JWT_SECRET, signOptions);
}

export default {
  signUpUser,
  signInUser,
  generateNewAccessToken,
};
