export interface ProductInput {
  name: string;
  description: string;
  price: number;
}

export interface ValidationError {
  message: string;
}

export interface ProductWithDetails {
  id: number;
  name: string;
  description: string;
  price: number;
  tags: string[];
  sellerId: number;
  createdAt: Date;
  updatedAt: Date;
  favoriteCount: number;
  sellerNickname: string;
  isLiked: boolean;
  images: string[];
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  tags?: string[];
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  tags: string[];
  imageUrls: string[];
}
