"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const client_s3_1 = require("@aws-sdk/client-s3");
const upload_service_1 = require("../services/upload.service");
const uploadService = new upload_service_1.UploadService();
// ① S3 클라이언트
const s3 = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const fileFilter = (_req, file, cb) => {
    var _a;
    try {
        const ext = (_a = file.originalname.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        if (!ext || !uploadService.config.allowedExtensions.includes(`.${ext}`)) {
            return cb(new Error("지원하지 않는 파일 형식입니다."));
        }
        cb(null, true);
    }
    catch (err) {
        cb(err);
    }
};
// ③ S3에 바로 저장
const upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        key: (_req, file, cb) => {
            const uniqueName = uploadService.generateUniqueFilename(file.originalname);
            cb(null, `uploads/${uniqueName}`); // 버킷 안의 폴더 경로
        },
    }),
    fileFilter,
    limits: { fileSize: uploadService.config.maxFileSize },
});
exports.default = upload;
//# sourceMappingURL=upload.middleware.js.map