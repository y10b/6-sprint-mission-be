import { Article } from "@prisma/client";

export interface ArticleWithDetails extends Article {
  authorNickname: string;
  likeCount: number;
  isLiked: boolean;
}

export interface ArticleListResponse {
  articles: ArticleWithDetails[];
  totalCount: number;
}

export interface CreateArticleDto {
  title: string;
  content: string;
}

export interface UpdateArticleDto {
  title?: string;
  content?: string;
}
