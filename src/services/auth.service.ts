import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma";
import { BadRequestError } from "../utils/customError";

export class AuthService {
  private readonly jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || "your-secret-key";
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const payload = jwt.verify(refreshToken, this.jwtSecret) as {
        userId: number;
      };

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new BadRequestError("유효하지 않은 리프레시 토큰입니다.");
      }

      const newAccessToken = jwt.sign({ userId: user.id }, this.jwtSecret, {
        expiresIn: "15m",
      });

      return newAccessToken;
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError("토큰이 만료되었거나 유효하지 않습니다.");
    }
  }
}
