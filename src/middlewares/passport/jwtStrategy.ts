import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
  VerifiedCallback,
} from "passport-jwt";
import { Request } from "express";
import userService from "../../services/userService";
import { User } from "@prisma/client";

interface JwtPayload {
  userId: User["id"];
}

if (!process.env.JWT_SECRET) {
  console.error("치명적 오류: JWT_SECRET 환경 변수가 설정되지 않았습니다.");
  process.exit(1);
}

const accessTokenOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
  passReqToCallback: false,
};

const cookieExtractor = (req: Request): string | null => {
  let token: string | null = null;
  if (req && req.cookies) {
    token = req.cookies["refreshToken"];
  }
  return token;
};

const refreshTokenOptions: StrategyOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET!,
  passReqToCallback: false,
};

type SafeUser = Omit<User, "password">;

async function jwtVerify(payload: JwtPayload, done: VerifiedCallback) {
  try {
    const user: SafeUser | null = await userService.getUserById(payload.userId);
    if (!user) {
      return done(null, false);
    }
    return done(null, user as User);
  } catch (error) {
    return done(error, false);
  }
}

const accessTokenStrategy = new JwtStrategy(accessTokenOptions, jwtVerify);
const refreshTokenStrategy = new JwtStrategy(refreshTokenOptions, jwtVerify);

export default {
  accessTokenStrategy,
  refreshTokenStrategy,
};
