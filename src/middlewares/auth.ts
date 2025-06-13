import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/express";
import { UnauthorizedError } from "../utils/customError";

interface AuthenticateToken extends RequestHandler {
  required: RequestHandler;
  optional: RequestHandler;
}

const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as {
      userId: number;
    };
  } catch (error) {
    return null;
  }
};

const createAuthMiddleware = (required: boolean): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 먼저 쿠키에서 토큰 확인
    let token = req.cookies.accessToken;

    // 쿠키에 없다면 Authorization 헤더 확인
    if (!token) {
      const authHeader = req.headers["authorization"];
      token = authHeader && authHeader.split(" ")[1];
    }

    if (!token) {
      if (required) {
        return next(new UnauthorizedError("로그인이 필요합니다."));
      }
      return next();
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      if (required) {
        return next(new UnauthorizedError("유효하지 않은 토큰입니다."));
      }
      return next();
    }

    req.userId = decoded.userId;
    next();
  };
};

const authenticateToken = createAuthMiddleware(true) as AuthenticateToken;
authenticateToken.required = createAuthMiddleware(true);
authenticateToken.optional = createAuthMiddleware(false);

export { authenticateToken };
