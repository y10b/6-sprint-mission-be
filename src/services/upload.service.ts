import { IUploadConfig } from "../types/upload.types";
import { BadRequestError } from "../utils/customError";
import { Request } from "express";
import path from "path";
import fs from "fs";

export class UploadService {
  public readonly config: IUploadConfig;

  constructor() {
    this.config = {
      uploadDir: "uploads",
      allowedExtensions: [".jpg", ".jpeg", ".png", ".gif"],
      maxFileSize: 5 * 1024 * 1024, // 5MB
    };
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory(): void {
    const uploadDir = path.join(process.cwd(), this.config.uploadDir);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  generateUniqueFilename(originalFilename: string): string {
    const ext = path.extname(originalFilename).toLowerCase();

    if (!this.config.allowedExtensions.includes(ext)) {
      throw new BadRequestError("지원하지 않는 파일 형식입니다.");
    }

    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    return uniqueName;
  }

  getImageUrl(req: Request, filename: string): string {
    return `${req.protocol}://${req.get("host")}/${
      this.config.uploadDir
    }/${filename}`;
  }

  validateFileSize(fileSize: number): void {
    if (fileSize > this.config.maxFileSize) {
      throw new BadRequestError("파일 크기가 너무 큽니다.");
    }
  }
}
