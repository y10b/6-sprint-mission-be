import express, { Request, Response } from "express";
import imageService from "../services/imageService";
import { asyncHandler } from "../utils/asyncHandler";
import passport from "../config/passport";
import uploadMiddleware from "../middlewares/uploadMiddleware";
import { CustomError } from "../utils/CustomError";
import { TokenUserPayload } from "../services/authService";

declare global {
  namespace Express {
    interface User extends TokenUserPayload {}
  }
}

const imageController = express.Router();

// POST /images/uploads - 이미지 업로드 (다중 파일)
imageController.post(
  "/uploads",
  passport.authenticate("access-token", {
    session: false,
    failWithError: true,
  }),
  uploadMiddleware.array("imageFiles", 5),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new CustomError(400, "업로드할 이미지 파일들이 없습니다.");
    }
    if (!req.user || !req.user.id) {
      throw new CustomError(
        401,
        "인증되지 않은 사용자이거나 사용자 ID가 없습니다."
      );
    }
    const uploaderId = req.user.id;
    const results = await imageService.uploadImages(req.files, uploaderId);
    res.status(201).json({
      message: "이미지들이 성공적으로 업로드되었습니다.",
      imageUrls: results.map((r) => r.imageUrl),
    });
  })
);

export default imageController;
