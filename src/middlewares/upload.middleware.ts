import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { UploadService } from "../services/upload.service";

const uploadService = new UploadService();

const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, uploadService.config.uploadDir);
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueName = uploadService.generateUniqueFilename(file.originalname);
    cb(null, uniqueName);
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
      cb(new Error("지원하지 않는 파일 형식입니다."));
      return;
    }

    if (file.size > uploadService.config.maxFileSize) {
      cb(new Error("파일 크기가 너무 큽니다."));
      return;
    }

    cb(null, true);
  } catch (error) {
    cb(error as Error);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadService.config.maxFileSize,
  },
});

export default upload;
