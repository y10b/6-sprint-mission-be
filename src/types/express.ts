import { Request } from "express";

export interface IAuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    nickname: string;
  };
}
