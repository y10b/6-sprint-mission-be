import express, { Request, Response } from "express";
import authService, { TokenUserPayload } from "../services/authService";
import passport from "../config/passport";
import { asyncHandler } from "../utils/asyncHandler";
import { CustomError } from "../utils/CustomError";

declare global {
  namespace Express {
    interface User extends TokenUserPayload {}
  }
}

const authController = express.Router();

authController.post(
  "/signup",
  asyncHandler(async (req: Request, res: Response) => {
    const { nickname, email, password, passwordConfirmation } = req.body;

    if (!nickname || !email || !password || !passwordConfirmation) {
      throw new CustomError(
        422,
        "닉네임, 이메일, 비밀번호, 비밀번호 확인은 필수입니다."
      );
    }
    const result = await authService.signUpUser({
      nickname,
      email,
      password,
      passwordConfirmation,
    });

    res.status(201).json(result);
  })
);

authController.post(
  "/signin",
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new CustomError(422, "이메일과 비밀번호를 모두 입력해주세요.");
    }
    const { accessToken, refreshToken, user } = await authService.signInUser(
      email,
      password
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
    });

    res.json({ accessToken, user });
  })
);

authController.post(
  "/refresh-token",
  passport.authenticate("refresh-token", {
    session: false,
    failWithError: true,
  }),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new CustomError(401, "토큰 갱신을 위한 사용자 정보가 없습니다.");
    }

    const user = req.user;

    const newAccessToken = authService.generateNewAccessToken(user);
    res.json({ accessToken: newAccessToken });
  })
);

export default authController;
