"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const customError_1 = require("../utils/customError");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class UploadService {
    constructor() {
        this.config = {
            uploadDir: "uploads",
            allowedExtensions: [".jpg", ".jpeg", ".png", ".gif"],
            maxFileSize: 5 * 1024 * 1024, // 5MB
        };
        this.ensureUploadDirectory();
    }
    ensureUploadDirectory() {
        const uploadDir = path_1.default.join(process.cwd(), this.config.uploadDir);
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
    }
    generateUniqueFilename(originalFilename) {
        const ext = path_1.default.extname(originalFilename).toLowerCase();
        if (!this.config.allowedExtensions.includes(ext)) {
            throw new customError_1.BadRequestError("지원하지 않는 파일 형식입니다.");
        }
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        return uniqueName;
    }
    getImageUrl(req, filename) {
        return `${req.protocol}://${req.get("host")}/${this.config.uploadDir}/${filename}`;
    }
    validateFileSize(fileSize) {
        if (fileSize > this.config.maxFileSize) {
            throw new customError_1.BadRequestError("파일 크기가 너무 큽니다.");
        }
    }
}
exports.UploadService = UploadService;
//# sourceMappingURL=upload.service.js.map