import multer, { FileFilterCallback } from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { Request } from "express";
import { UploadService } from "../services/upload.service";

const uploadService = new UploadService();

// ① S3 클라이언트
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  try {
    const ext = file.originalname.split(".").pop()?.toLowerCase();
    if (!ext || !uploadService.config.allowedExtensions.includes(`.${ext}`)) {
      return cb(new Error("지원하지 않는 파일 형식입니다."));
    }
    cb(null, true);
  } catch (err) {
    cb(err as Error);
  }
};

// ③ S3에 바로 저장
const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET_NAME as string,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (
      _req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, key?: string) => void
    ) => {
      const uniqueName = uploadService.generateUniqueFilename(
        file.originalname
      );
      cb(null, `uploads/${uniqueName}`); // 버킷 안의 폴더 경로
    },
  }),
  fileFilter,
  limits: { fileSize: uploadService.config.maxFileSize },
});

export default upload;
