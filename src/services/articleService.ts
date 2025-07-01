import articleRepository from "../repositories/articleRepository";
import userRepository from "../repositories/userRepository";
import { CustomError } from "../utils/CustomError";
import { Prisma } from "@prisma/client";

type ArticleWithWriterAndCounts = Prisma.ArticleGetPayload<{
  include: {
    writer: { select: { id: true; nickname: true; image: true } };
    _count: { select: { likedBy: true; comments: true } };
  };
}>;

function formatArticleForList(article: ArticleWithWriterAndCounts | null): {
  id: number;
  title: string;
  content: string;
  image: string | null;
  writer: { id: number; nickname: string };
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
} | null {
  if (!article) return null;
  return {
    id: article.id,
    title: article.title,
    content: article.content,
    image: article.image,
    writer: {
      id: article.writer.id,
      nickname: article.writer.nickname,
    },
    likeCount: article._count?.likedBy || 0,
    commentCount: article._count?.comments || 0,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

type ArticleWithWriterCommentsLikes = Prisma.ArticleGetPayload<{
  include: {
    writer: { select: { id: true; nickname: true; image: true } };
    comments: {
      orderBy: { createdAt: "desc" };
      take: 5;
      include: {
        writer: { select: { id: true; nickname: true; image: true } };
      };
    };
    likedBy: { select: { userId: true } } | false;
    _count: { select: { likedBy: true; comments: true } };
  };
}>;

type FormattedComment = {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  writer: {
    id: number;
    nickname: string;
    image: string | null;
  };
};

function formatArticleForDetail(
  article: ArticleWithWriterCommentsLikes | null,
  userId?: number
): {
  id: number;
  title: string;
  content: string;
  image: string | null;
  writer: { id: number; nickname: string; image: string | null };
  comments: FormattedComment[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
} | null {
  if (!article) return null;
  return {
    id: article.id,
    title: article.title,
    content: article.content,
    image: article.image,
    writer: {
      id: article.writer.id,
      nickname: article.writer.nickname,
      image: article.writer.image,
    },
    comments:
      article.comments?.map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        writer: {
          id: comment.writer.id,
          nickname: comment.writer.nickname,
          image: comment.writer.image,
        },
      })) || [],
    likeCount: article._count?.likedBy || 0,
    commentCount: article._count?.comments || 0,
    isLiked:
      userId && Array.isArray(article.likedBy)
        ? article.likedBy.some(
            (like: { userId: number }) => like.userId === userId
          )
        : false,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

interface ArticleCreateData {
  title: string;
  content: string;
  image?: string;
  writerId: number;
}

async function createArticle(
  articleData: ArticleCreateData
): Promise<ReturnType<typeof formatArticleForDetail> | null> {
  const { title, content, writerId, image } = articleData;

  if (!title || title.trim() === "") {
    throw new CustomError(422, "게시글 제목을 입력해주세요.");
  }
  if (!content || content.trim() === "") {
    throw new CustomError(422, "게시글 내용을 입력해주세요.");
  }
  if (!writerId) {
    throw new CustomError(400, "작성자 정보가 누락되었습니다.");
  }

  const writer = await userRepository.findById(writerId);
  if (!writer) {
    throw new CustomError(404, "게시글을 작성할 사용자를 찾을 수 없습니다.");
  }

  const createdArticle = await articleRepository.create({
    title,
    content,
    image,
    writer: {
      connect: { id: writerId },
    },
  });

  const detailedArticle = await articleRepository.findById(
    createdArticle.id,
    writerId
  );
  return formatArticleForDetail(detailedArticle, writerId);
}

interface GetArticlesQueryParams {
  page?: string | number;
  pageSize?: string | number;
  orderBy?: "recent" | "like";
  keyword?: string;
  [key: string]: any;
}

async function getArticles(
  queryParams: GetArticlesQueryParams,
  userId?: number
): Promise<{
  totalCount: number;
  list: (ReturnType<typeof formatArticleForList> | null)[];
}> {
  const {
    page = "1",
    pageSize = "10",
    orderBy = "recent",
    keyword,
  } = queryParams;

  const skip =
    (parseInt(String(page), 10) - 1) * parseInt(String(pageSize), 10);
  const take = parseInt(String(pageSize), 10);

  const where: Prisma.ArticleWhereInput = {};
  if (keyword) {
    where.OR = [
      { title: { contains: keyword, mode: "insensitive" } },
      { content: { contains: keyword, mode: "insensitive" } },
    ];
  }

  let prismaOrderBy:
    | Prisma.ArticleOrderByWithRelationInput
    | Prisma.ArticleOrderByWithRelationInput[] = {};
  if (orderBy === "like") {
    prismaOrderBy = { likedBy: { _count: "desc" } };
  } else {
    prismaOrderBy = { createdAt: "desc" };
  }

  const { list, totalCount } = await articleRepository.findAll(
    { skip, take, where, orderBy: prismaOrderBy },
    userId
  );

  return {
    totalCount,
    list: list.map((article) => formatArticleForList(article)),
  };
}

async function getArticleById(
  articleId: number,
  userId?: number
): Promise<ReturnType<typeof formatArticleForDetail> | null> {
  const article = await articleRepository.findById(articleId, userId);
  if (!article) {
    throw new CustomError(404, "게시글을 찾을 수 없습니다.");
  }
  return formatArticleForDetail(article, userId);
}

interface ArticleUpdateData {
  title?: string;
  content?: string;
  image?: string | null;
}

async function updateArticle(
  articleId: number,
  updateData: ArticleUpdateData,
  writerId: number
): Promise<ReturnType<typeof formatArticleForDetail> | null> {
  const article = await articleRepository.findById(articleId, writerId);
  if (!article) {
    throw new CustomError(404, "수정할 게시글을 찾을 수 없습니다.");
  }

  if (article.writer.id !== writerId) {
    throw new CustomError(403, "게시글을 수정할 권한이 없습니다.");
  }

  const { title, content, image } = updateData;

  const dataToUpdate: Prisma.ArticleUpdateInput = {};

  if (title !== undefined) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) throw new CustomError(422, "제목은 공백일 수 없습니다.");
    dataToUpdate.title = trimmedTitle;
  }

  if (content !== undefined) {
    const trimmedContent = content.trim();
    if (!trimmedContent)
      throw new CustomError(422, "내용은 공백일 수 없습니다.");
    dataToUpdate.content = trimmedContent;
  }

  if (image !== undefined) {
    dataToUpdate.image = image;
  }

  if (Object.keys(dataToUpdate).length === 0) {
    throw new CustomError(422, "수정할 내용이 없습니다.");
  }

  await articleRepository.update(articleId, dataToUpdate);
  const updatedArticle = await articleRepository.findById(articleId, writerId);
  return formatArticleForDetail(updatedArticle, writerId);
}

async function deleteArticle(
  articleId: number,
  writerId: number
): Promise<void> {
  const article = await articleRepository.findById(articleId, writerId);
  if (!article) {
    throw new CustomError(404, "삭제할 게시글을 찾을 수 없습니다.");
  }

  if (article.writer.id !== writerId) {
    throw new CustomError(403, "게시글을 삭제할 권한이 없습니다.");
  }
  await articleRepository.deleteById(articleId);
}

async function likeArticle(
  articleId: number,
  userId: number
): Promise<ReturnType<typeof formatArticleForDetail> | null> {
  const article = await articleRepository.findById(articleId, userId);
  if (!article) {
    throw new CustomError(404, "게시글을 찾을 수 없습니다.");
  }
  const existingLike = await articleRepository.findLike(articleId, userId);
  if (existingLike) {
    return formatArticleForDetail(article, userId);
  }
  await articleRepository.createLike(articleId, userId);
  const updatedArticle = await articleRepository.findById(articleId, userId);
  if (!updatedArticle)
    throw new CustomError(404, "업데이트된 게시글을 찾을 수 없습니다.");
  return formatArticleForDetail(updatedArticle, userId);
}

async function unlikeArticle(
  articleId: number,
  userId: number
): Promise<ReturnType<typeof formatArticleForDetail> | null> {
  const article = await articleRepository.findById(articleId, userId);
  if (!article) {
    throw new CustomError(404, "게시글을 찾을 수 없습니다.");
  }
  const existingLike = await articleRepository.findLike(articleId, userId);
  if (!existingLike) {
    return formatArticleForDetail(article, userId);
  }
  await articleRepository.deleteLike(articleId, userId);
  const updatedArticle = await articleRepository.findById(articleId, userId);
  if (!updatedArticle)
    throw new CustomError(404, "업데이트된 게시글을 찾을 수 없습니다.");
  return formatArticleForDetail(updatedArticle, userId);
}

export default {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  likeArticle,
  unlikeArticle,
};
