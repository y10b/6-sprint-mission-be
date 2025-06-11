import { Express } from "express";
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      user?: {
        id: number;
        email: string;
        nickname: string;
      };
    }
  }
}

export {};
