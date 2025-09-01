import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import router from "./routes/index.route";
import userRouter from "./routes/user.route";
import { disconnectPrisma } from "./db/prisma";

import { errorHandler } from "./middlewares/error.middleware";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT;
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : process.env.NODE_ENV === "production"
  ? [
      "https://toieeeeeea.shop",
      "https://www.toieeeeeea.shop",
      "https://6-sprint-mission-fe-seven.vercel.app",
      "https://6-sprint-mission-fe-y10bs-projects.vercel.app",
      "https://pandamarket-frontend.vercel.app", // 추가 예상 도메인
    ]
  : [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://toieeeeeea.shop",
      "https://www.toieeeeeea.shop",
    ];

const corsOptions = {
  origin: corsOrigins, // 환경변수에서 읽은 origins 사용
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Set-Cookie"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};



app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// 정적 파일 서빙 (이미지 접근용)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 기본 루트 엔드포인트 (간단한 상태 확인)
app.get("/", (req, res) => {
  res.json({
    message: "PandaMarket API Server",
    status: "running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// 라우터 등록
app.use(router); // 메인 라우터 (api 접두사 포함)
app.use("/users", userRouter);

// 에러 핸들러
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`서버가 작동 중입니다. ${PORT}`);
  // 서버 시작됨
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
});

export default app;
