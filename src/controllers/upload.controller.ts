import { Request, Response, NextFunction } from "express";
import { UploadResponse } from "../types/upload.types";

// Multer-S3가 추가한 location 필드를 포함한 타입 확장
interface FileRequest extends Request {
  file?: Express.Multer.File & { location?: string };
}

export const uploadImage = async (
  req: FileRequest,
  res: Response<UploadResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res
        .status(400)
        .json({ message: "이미지 파일이 필요합니다.", imageUrl: "" });
      return;
    }

    // S3 URL
    const imageUrl = req.file.location as string;
    res.status(200).json({ imageUrl });
    return;
  } catch (error) {
    next(error);
  }
};
