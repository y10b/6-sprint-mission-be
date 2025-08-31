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
    console.error("Token verification error:", error);
    return null;
  }
};

const createAuthMiddleware = (required: boolean): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log("Cookies received:", req.cookies);
    console.log("Headers received:", req.headers);

    const token = req.cookies.accessToken;
    console.log("Access token from cookies:", token);

    if (!token) {
      if (required) {
        console.log("No token found in request");
        return next(new UnauthorizedError("로그인이 필요합니다."));
      }
      return next();
    }

    const decoded = verifyToken(token);
    console.log("Decoded token:", decoded);

    if (!decoded) {
      if (required) {
        return next(new UnauthorizedError("유효하지 않은 토큰입니다."));
      }
      return next();
    }

    (req as AuthRequest).user = {
      id: decoded.userId,
      email: "",
      nickname: "",
    };
    req.userId = decoded.userId;

    next();
  };
};

const authenticateToken = createAuthMiddleware(true) as AuthenticateToken;
authenticateToken.required = createAuthMiddleware(true);
authenticateToken.optional = createAuthMiddleware(false);

export { authenticateToken };
