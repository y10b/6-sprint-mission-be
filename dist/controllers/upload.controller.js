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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePresignedUrl = exports.uploadImage = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const upload_service_1 = require("../services/upload.service");
const uploadImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            res
                .status(400)
                .json({ message: "이미지 파일이 필요합니다.", imageUrl: "" });
            return;
        }
        // S3 URL
        const imageUrl = req.file.location;
        res.status(200).json({ imageUrl });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.uploadImage = uploadImage;
// Presigned URL 생성 컨트롤러
const generatePresignedUrl = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileName, fileType } = req.body;
        if (!fileName || !fileType) {
            res.status(400).json({ message: "fileName 과 fileType 이 필요합니다." });
            return;
        }
        const uploadService = new upload_service_1.UploadService();
        const uniqueName = uploadService.generateUniqueFilename(fileName);
        const key = `uploads/${uniqueName}`;
        const s3 = new client_s3_1.S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
        const command = new client_s3_1.PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
        });
        const uploadUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 3600 }); // 1시간 유효
        const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        res.status(200).json({ uploadUrl, fileUrl });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.generatePresignedUrl = generatePresignedUrl;
//# sourceMappingURL=upload.controller.js.map