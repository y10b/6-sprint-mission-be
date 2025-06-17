import express, { Request, Response } from "express";
import commentService from "../services/commentService";
import { asyncHandler } from "../utils/asyncHandler";
import passport from "../config/passport";
import { CustomError } from "../utils/CustomError";
import { TokenUserPayload } from "../services/authService";

declare global {
  namespace Express {
    interface User extends TokenUserPayload {}
  }
}

const commentController = express.Router();

commentController.post(
  "/products/:productId/comments",
  passport.authenticate("access-token", {
    session: false,
    failWithError: true,
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    if (!req.user || !req.user.id) {
      throw new CustomError(
        401,
        "인증되지 않은 사용자이거나 사용자 ID가 없습니다."
      );
    }
    const writerId = req.user.id;
    const { content } = req.body;
    const comment = await commentService.createProductComment(
      productId,
      writerId,
      content
    );
    res.status(201).json(comment);
  })
);

commentController.get(
  "/products/:productId/comments",
  asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const comments = await commentService.getProductComments(
      productId,
      req.query
    );
    res.json(comments);
  })
);

commentController.post(
  "/articles/:articleId/comments",
  passport.authenticate("access-token", {
    session: false,
    failWithError: true,
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { articleId } = req.params;
    if (!req.user || !req.user.id) {
      throw new CustomError(
        401,
        "인증되지 않은 사용자이거나 사용자 ID가 없습니다."
      );
    }
    const writerId = req.user.id;
    const { content } = req.body;
    const comment = await commentService.createArticleComment(
      parseInt(articleId, 10),
      writerId,
      content
    );
    res.status(201).json(comment);
  })
);

commentController.get(
  "/articles/:articleId/comments",
  asyncHandler(async (req: Request, res: Response) => {
    const { articleId } = req.params;
    const comments = await commentService.getArticleComments(
      parseInt(articleId, 10),
      req.query
    );
    res.json(comments);
  })
);

commentController.patch(
  "/comments/:commentId",
  passport.authenticate("access-token", {
    session: false,
    failWithError: true,
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { commentId } = req.params;
    if (!req.user || !req.user.id) {
      throw new CustomError(
        401,
        "인증되지 않은 사용자이거나 사용자 ID가 없습니다."
      );
    }
    const writerId = req.user.id;
    const { content } = req.body;
    const updatedComment = await commentService.updateComment(
      parseInt(commentId, 10),
      content,
      writerId
    );
    res.json(updatedComment);
  })
);

commentController.delete(
  "/comments/:commentId",
  passport.authenticate("access-token", {
    session: false,
    failWithError: true,
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { commentId } = req.params;
    if (!req.user || !req.user.id) {
      throw new CustomError(
        401,
        "인증되지 않은 사용자이거나 사용자 ID가 없습니다."
      );
    }
    const writerId = req.user.id;

    await commentService.deleteComment(parseInt(commentId, 10), writerId);
    res.status(204).send();
  })
);

export default commentController;
