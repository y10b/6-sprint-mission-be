import { Article } from "@prisma/client";
import { TId } from "./express.d";

/**
 * 게시글 관련 타입 및 인터페이스 정의
 */

// 게시글 상세 정보 인터페이스
export interface IArticleWithDetails extends Article {
  authorNickname: string;
  likeCount: number;
  isLiked: boolean;
}

// 게시글 목록 응답 인터페이스
export interface IArticleListResponse {
  articles: IArticleWithDetails[];
  totalCount: number;
}

// 게시글 생성 DTO 타입
export type TCreateArticleDto = {
  title: string;
  content: string;
  images?: string;
};

// 게시글 업데이트 DTO 타입
export type TUpdateArticleDto = {
  title?: string;
  content?: string;
  images?: string;
};
