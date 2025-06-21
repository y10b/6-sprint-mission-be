import path from "path";
import fs from "fs/promises";
import { CustomError } from "../utils/CustomError";
import prisma from "../config/prisma.js";
import { Express } from "express";

const LOCAL_UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "images"
);

async function uploadImage(
  fileObject: Express.Multer.File,
  uploaderId: number
) {
  if (!fileObject) {
    throw new CustomError(400, "업로드할 파일이 제공되지 않았습니다.");
  }

  try {
    await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
    const fileExtension = path.extname(fileObject.originalname);
    const fileName = `${Date.now()}-${uploaderId}${fileExtension}`;
    const localFilePath = path.join(LOCAL_UPLOAD_DIR, fileName);

    if (fileObject.buffer) {
      await fs.writeFile(localFilePath, fileObject.buffer);
    } else if (fileObject.path) {
      await fs.rename(fileObject.path, localFilePath);
    } else {
      throw new CustomError(500, "파일 데이터를 찾을 수 없습니다.");
    }

    const imageUrl = `/uploads/images/${fileName}`;

    return { imageUrl };
  } catch (error) {
    console.error("로컬 이미지 저장 실패:", error);
    throw new CustomError(500, "이미지 업로드 중 서버 오류가 발생했습니다.");
  }
}

async function uploadImages(
  fileObjects: Express.Multer.File[],
  uploaderId: number
) {
  if (!fileObjects || fileObjects.length === 0) {
    throw new CustomError(400, "업로드할 파일들이 제공되지 않았습니다.");
  }
  const uploadPromises = fileObjects.map((file: Express.Multer.File) =>
    uploadImage(file, uploaderId)
  );
  return Promise.all(uploadPromises);
}

export default { uploadImage, uploadImages };
