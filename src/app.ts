import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import router from "./routes/index.route";
import userRouter from "./routes/user.route";

import { errorHandler } from "./middlewares/error.middleware";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT;
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : [];

const corsOptions = {
  origin: corsOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// 정적 파일 서빙 (이미지 접근용)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 라우터 등록
app.use(router); // 메인 라우터 (api 접두사 포함)
app.use("/users", userRouter);

// 에러 핸들러
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`서버가 작동 중입니다. ${PORT}`);
});
