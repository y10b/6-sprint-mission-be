import { Request, Response, NextFunction } from "express";
import { UploadService } from "../services/upload.service";
import { UploadResponse } from "../types/upload.types";

interface FileRequest extends Request {
  file?: Express.Multer.File;
}

const uploadService = new UploadService();

export const uploadImage = async (
  req: FileRequest,
  res: Response<UploadResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        message: "이미지 파일이 필요합니다.",
        imageUrl: "",
      });
      return;
    }

    const imageUrl = uploadService.getImageUrl(req, req.file.filename);
    res.status(200).json({ imageUrl });
  } catch (error) {
    next(error);
  }
};
