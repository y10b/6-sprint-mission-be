import { TId } from "./express.d";

/**
 * 상품 관련 타입 및 인터페이스 정의
 */

// 상품 입력 인터페이스
export interface IProductInput {
  name: string;
  description: string;
  price: number;
}

// 유효성 검사 에러 타입
export type TValidationError = {
  message: string;
};

// 상품 상세 정보 인터페이스
export interface IProductWithDetails {
  id: TId;
  name: string;
  description: string;
  price: number;
  tags: string[];
  sellerId: TId;
  createdAt: Date;
  updatedAt: Date;
  favoriteCount: number;
  sellerNickname: string;
  isLiked: boolean;
  images: string[];
}

// 상품 업데이트 DTO 타입
export type TUpdateProductDto = {
  name?: string;
  description?: string;
  price?: number;
  tags?: string[];
};

// 상품 생성 DTO 타입
export type TCreateProductDto = {
  name: string;
  description: string;
  price: number;
  tags: string[];
  imageUrls: string[];
};
