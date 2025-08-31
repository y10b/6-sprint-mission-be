import { Request, Response, NextFunction } from "express";
import { CommentService } from "../services/comment.service";
import { BadRequestError } from "../utils/customError";

const commentService = new CommentService();

// 게시글에 댓글 달기
export const createCommentForArticle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { articleId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "로그인이 필요합니다." });
      return;
    }

    const comment = await commentService.createArticleComment(
      Number(articleId),
      userId,
      content
    );

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

// 상품에 댓글 달기
export const createCommentForProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "로그인이 필요합니다." });
      return;
    }

    const comment = await commentService.createProductComment(
      Number(productId),
      userId,
      content
    );

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

// 댓글 수정
export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "로그인이 필요합니다." });
      return;
    }

    const comment = await commentService.updateComment(
      Number(id),
      userId,
      content
    );

    res.json(comment);
  } catch (error) {
    next(error);
  }
};

// 댓글 삭제
export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "로그인이 필요합니다." });
      return;
    }

    await commentService.deleteComment(Number(id), userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// 상품의 댓글 조회
export const getCommentsForProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;
    const comments = await commentService.getCommentsForProduct(
      Number(productId)
    );
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

// 게시글의 댓글 조회
export const getCommentsForArticle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { articleId } = req.params;
    const comments = await commentService.getCommentsForArticle(
      Number(articleId)
    );
    res.json(comments);
  } catch (error) {
    next(error);
  }
};
