import commentRepository from "../repositories/commentRepository";
import productRepository from "../repositories/productRepository";
import articleRepository from "../repositories/articleRepository";
import { CustomError } from "../utils/CustomError";
import { Comment } from "@prisma/client";

interface CommentQueryParams {
  page?: string | number;
  pageSize?: string | number;
}

async function createProductComment(
  productId: string,
  writerId: number,
  content: string
): Promise<Comment> {
  if (!content || content.trim() === "") {
    throw new CustomError(422, "댓글 내용을 입력해주세요.");
  }

  const product = await productRepository.findById(productId);
  if (!product) {
    throw new CustomError(404, "댓글을 작성할 상품을 찾을 수 없습니다.");
  }

  return commentRepository.create({
    content,
    writer: { connect: { id: writerId } },
    product: { connect: { id: parseInt(productId, 10) } },
  });
}

async function getProductComments(
  productId: string,
  queryParams: CommentQueryParams
): Promise<{ list: Comment[]; totalCount: number }> {
  const product = await productRepository.findById(productId);
  if (!product) {
    throw new CustomError(404, "상품을 찾을 수 없습니다.");
  }

  const page = queryParams.page ? parseInt(String(queryParams.page), 10) : 1;
  const pageSize = queryParams.pageSize
    ? parseInt(String(queryParams.pageSize), 10)
    : 10;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const commentList = await commentRepository.findByProductId(
    parseInt(productId, 10),
    { skip, take }
  );
  // NOTE: If commentRepository.findByProductId performs pagination,
  // commentList.length will be the count for the current page, not the total.
  return { list: commentList, totalCount: commentList.length };
}

async function createArticleComment(
  articleId: number,
  writerId: number,
  content: string
): Promise<Comment> {
  if (!content || content.trim() === "") {
    throw new CustomError(422, "댓글 내용을 입력해주세요.");
  }

  const article = await articleRepository.findById(articleId);
  if (!article) {
    throw new CustomError(404, "댓글을 작성할 게시글을 찾을 수 없습니다.");
  }

  return commentRepository.create({
    content,
    writer: { connect: { id: writerId } },
    article: { connect: { id: articleId } },
  });
}

async function getArticleComments(
  articleId: number,
  queryParams: CommentQueryParams
): Promise<{ list: Comment[]; totalCount: number }> {
  const article = await articleRepository.findById(articleId);
  if (!article) {
    throw new CustomError(404, "게시글을 찾을 수 없습니다.");
  }

  const page = queryParams.page ? parseInt(String(queryParams.page), 10) : 1;
  const pageSize = queryParams.pageSize
    ? parseInt(String(queryParams.pageSize), 10)
    : 10;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const commentList = await commentRepository.findByArticleId(articleId, {
    skip,
    take,
  });

  return { list: commentList, totalCount: commentList.length };
}

async function updateComment(
  commentId: number,
  content: string,
  writerId: number
): Promise<Comment> {
  if (!content || content.trim() === "") {
    throw new CustomError(422, "댓글 내용을 입력해주세요.");
  }

  const comment = await commentRepository.findById(commentId);
  if (!comment) {
    throw new CustomError(404, "수정할 댓글을 찾을 수 없습니다.");
  }

  if (comment.writerId !== writerId) {
    throw new CustomError(403, "댓글을 수정할 권한이 없습니다.");
  }

  return commentRepository.update(commentId, { content });
}

async function deleteComment(
  commentId: number,
  writerId: number
): Promise<void> {
  const comment = await commentRepository.findById(commentId);
  if (!comment) {
    throw new CustomError(404, "삭제할 댓글을 찾을 수 없습니다.");
  }

  if (comment.writerId !== writerId) {
    throw new CustomError(403, "댓글을 삭제할 권한이 없습니다.");
  }

  await commentRepository.deleteById(commentId);
}

export default {
  createProductComment,
  getProductComments,
  createArticleComment,
  getArticleComments,
  updateComment,
  deleteComment,
};
