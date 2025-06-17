import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { CustomError } from "../utils/CustomError";
import { Request } from "express";

const storage = multer.diskStorage({
  destination: async function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) {
    const uploadPath = path.join(process.cwd(), "temp_uploads");
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      console.error("임시 업로드 디렉토리 생성 실패:", error);
      cb(
        new CustomError(
          500,
          "임시 업로드 디렉토리 생성 중 오류가 발생했습니다."
        ),
        ""
      );
    }
  },
  filename: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new CustomError(
        400,
        "지원하지 않는 이미지 파일 형식입니다. (jpeg, png, gif, webp만 가능)"
      )
    );
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

export default upload;
