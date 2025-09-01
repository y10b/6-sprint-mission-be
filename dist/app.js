"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const index_route_1 = __importDefault(require("./routes/index.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const prisma_1 = require("./db/prisma");
const error_middleware_1 = require("./middlewares/error.middleware");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
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
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// 정적 파일 서빙 (이미지 접근용)
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
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
app.use(index_route_1.default); // 메인 라우터 (api 접두사 포함)
app.use("/users", user_route_1.default);
// 에러 핸들러
app.use(error_middleware_1.errorHandler);
const server = app.listen(PORT, () => {
    console.log(`서버가 작동 중입니다. ${PORT}`);
    // 서버 시작됨
});
// Graceful shutdown
process.on("SIGTERM", () => __awaiter(void 0, void 0, void 0, function* () {
    server.close(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, prisma_1.disconnectPrisma)();
        process.exit(0);
    }));
}));
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    server.close(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, prisma_1.disconnectPrisma)();
        process.exit(0);
    }));
}));
exports.default = app;
//# sourceMappingURL=app.js.map