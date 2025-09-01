import express, { Request, Response } from "express";
import articleService from "../services/articleService";
import passport from "../config/passport";
import { asyncHandler } from "../utils/asyncHandler";
import { CustomError } from "../utils/CustomError";
import { TokenUserPayload } from "../services/authService";

declare global {
  namespace Express {
    interface User extends TokenUserPayload {}
  }
}

const articleController = express.Router();

articleController.post(
  "/",
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
    const writerId = req.user.id;
    const articleData = { ...req.body, writerId };

    if (!articleData.title || !articleData.content) {
      throw new CustomError(422, "제목과 내용은 필수입니다.");
    }

    const article = await articleService.createArticle(articleData);
    res.status(201).json(article);
  })
);

articleController.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const articles = await articleService.getArticles(req.query, req.user?.id);
    res.json(articles);
  })
);

articleController.get(
  "/:articleId",
  asyncHandler(async (req: Request, res: Response) => {
    const { articleId } = req.params;
    const article = await articleService.getArticleById(
      parseInt(articleId, 10),
      req.user?.id
    );
    res.json(article);
  })
);

articleController.patch(
  "/:articleId",
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
    const { articleId } = req.params;
    const writerId = req.user.id;
    const updateData = req.body;

    const updatedArticle = await articleService.updateArticle(
      parseInt(articleId, 10),
      updateData,
      writerId
    );
    res.json(updatedArticle);
  })
);

articleController.delete(
  "/:articleId",
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
    const { articleId } = req.params;
    const writerId = req.user.id;

    await articleService.deleteArticle(parseInt(articleId, 10), writerId);
    res.status(204).send();
  })
);

articleController.post(
  "/:articleId/like",
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
    const { articleId } = req.params;
    const userId = req.user.id;
    const result = await articleService.likeArticle(
      parseInt(articleId, 10),
      userId
    );
    res
      .status(201)
      .json({ message: "게시글에 좋아요를 눌렀습니다.", data: result });
  })
);

articleController.delete(
  "/:articleId/like",
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
    const { articleId } = req.params;
    const userId = req.user.id;
    await articleService.unlikeArticle(parseInt(articleId, 10), userId);
    res.status(200).json({ message: "게시글 좋아요를 취소했습니다." });
  })
);

export default articleController;
