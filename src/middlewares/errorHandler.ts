import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/CustomError";

interface AppError extends Error {
  statusCode?: number;
  status?: number;
  code?: number;
}

export default function errorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error("Error caught by errorHandler:", error);

  let statusCode = error.statusCode || error.status || error.code || 500;
  let responseMessage = error.message || "서버 내부 오류가 발생했습니다.";

  if (error instanceof CustomError) {
    statusCode = error.statusCode;
    responseMessage = error.message;
  } else if (
    error.status === 401 ||
    (error.name === "AuthenticationError" && error.message === "Unauthorized")
  ) {
    statusCode = 401;
    responseMessage =
      "인증에 실패했습니다. 유효한 토큰이 아니거나 토큰이 만료되었을 수 있습니다.";
  } else if (error.name === "SyntaxError" && error.message.includes("JSON")) {
    statusCode = 400;
    responseMessage = "잘못된 JSON 형식입니다.";
  }

  res.status(statusCode).json({
    path: req.path,
    method: req.method,
    message: responseMessage,
    timestamp: new Date().toISOString(),
  });
}
