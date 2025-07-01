import express, { Request, Response } from "express";
import userService from "../services/userService";
import passport from "../config/passport";
import { asyncHandler } from "../utils/asyncHandler";
import { CustomError } from "../utils/CustomError";
import { TokenUserPayload } from "../services/authService";

declare global {
  namespace Express {
    interface User extends TokenUserPayload {}
  }
}

const userController = express.Router();

// GET /users/me - 현재 로그인된 사용자 정보 조회
userController.get(
  "/me",
  passport.authenticate("access-token", {
    session: false,
    failWithError: true,
  }),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
      throw new CustomError(
        401,
        "인증되지 않은 사용자이거나 사용자 ID가 없습니다."
      );
    }
    const userId = req.user.id;

    const userProfile = await userService.getUserProfile(userId);
    res.json(userProfile);
  })
);

// PATCH /users/me - 현재 로그인된 사용자 정보 수정 (닉네임, 프로필 이미지 등)
userController.patch(
  "/me",
  passport.authenticate("access-token", {
    session: false,
    failWithError: true,
  }),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
      throw new CustomError(
        401,
        "인증되지 않은 사용자이거나 사용자 ID가 없습니다."
      );
    }
    const userId = req.user.id;
    const updateData = req.body;
    if (Object.keys(updateData).length === 0) {
      throw new CustomError(400, "수정할 내용이 없습니다.");
    }
    const updatedUser = await userService.updateUserProfile(userId, updateData);
    res.json(updatedUser);
  })
);

// PATCH /users/me/password - 현재 로그인된 사용자 비밀번호 변경
userController.patch(
  "/me/password",
  passport.authenticate("access-token", {
    session: false,
    failWithError: true,
  }),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
      throw new CustomError(
        401,
        "인증되지 않은 사용자이거나 사용자 ID가 없습니다."
      );
    }
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new CustomError(
        422,
        "현재 비밀번호와 새 비밀번호를 모두 입력해야 합니다."
      );
    }
    await userService.updateUserPassword(userId, currentPassword, newPassword);
    res.json({ message: "비밀번호가 성공적으로 변경되었습니다." });
  })
);

// GET /users/me/products - 현재 로그인된 사용자가 등록한 상품 목록 조회
userController.get(
  "/me/products",
  passport.authenticate("access-token", {
    session: false,
    failWithError: true,
  }),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
      throw new CustomError(
        401,
        "인증되지 않은 사용자이거나 사용자 ID가 없습니다."
      );
    }
    const userId = req.user.id;
    const products = await userService.getUserProducts(userId, req.query);
    res.json(products);
  })
);

// GET /users/me/favorites - 현재 로그인된 사용자가 즐겨찾기한 상품 및 게시글 목록 조회
userController.get(
  "/me/favorites",
  passport.authenticate("access-token", {
    session: false,
    failWithError: true,
  }),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
      throw new CustomError(
        401,
        "인증되지 않은 사용자이거나 사용자 ID가 없습니다."
      );
    }
    const userId = req.user.id;
    const favorites = await userService.getUserFavorites(userId, req.query);
    res.json(favorites);
  })
);

export default userController;
