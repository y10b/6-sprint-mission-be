import { Request, Response, NextFunction } from "express";
import { IUploadResponse } from "../types/upload.types";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { UploadService } from "../services/upload.service";

// Multer-S3가 추가한 location 필드를 포함한 타입 확장
interface IFileRequest extends Request {
  file?: Express.Multer.File & { location?: string };
}

export const uploadImage = async (
  req: IFileRequest,
  res: Response<IUploadResponse>,
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

// Presigned URL 생성 컨트롤러
export const generatePresignedUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fileName, fileType } = req.body as {
      fileName?: string;
      fileType?: string;
    };

    if (!fileName || !fileType) {
      res.status(400).json({ message: "fileName 과 fileType 이 필요합니다." });
      return;
    }

    const uploadService = new UploadService();
    const uniqueName = uploadService.generateUniqueFilename(fileName);
    const key = `uploads/${uniqueName}`;

    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1시간 유효

    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.status(200).json({ uploadUrl, fileUrl });
    return;
  } catch (error) {
    next(error);
  }
};
