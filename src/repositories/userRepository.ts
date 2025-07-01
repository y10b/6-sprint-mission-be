import prisma from "../config/prisma";
import { Prisma, User, ProductLike, ArticleLike } from "@prisma/client";

type SafeUser = Omit<User, "password">;

interface PaginationOptions {
  skip?: number;
  take?: number;
}

type FavoriteProductItem = ProductLike & {
  product: {
    id: number;
    name: string;
    price: number;
    images: string[];
  };
};

type FavoriteArticleItem = ArticleLike & {
  article: {
    id: number;
    title: string;
    image: string | null;
  };
};

async function create(data: Prisma.UserCreateInput): Promise<SafeUser> {
  return prisma.user.create({
    data,
    select: {
      id: true,
      email: true,
      nickname: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function findById(id: number): Promise<SafeUser | null> {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      nickname: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function findByIdWithPassword(id: number): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  });
}

async function findByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  });
}

async function findByNickname(
  nickname: string
): Promise<Pick<User, "id" | "nickname"> | null> {
  return prisma.user.findUnique({
    where: { nickname },
    select: {
      id: true,
      nickname: true,
    },
  });
}

async function update(
  id: number,
  data: Prisma.UserUpdateInput
): Promise<SafeUser> {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      nickname: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function findUserFavoriteProducts(
  userId: number,
  options: PaginationOptions = {}
): Promise<FavoriteProductItem[]> {
  const { skip, take } = options;
  return prisma.productLike.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
        },
      },
    },
    skip,
    take,
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function findUserFavoriteArticles(
  userId: number,
  options: PaginationOptions = {}
): Promise<FavoriteArticleItem[]> {
  const { skip, take } = options;
  return prisma.articleLike.findMany({
    where: { userId },
    include: {
      article: {
        select: {
          id: true,
          title: true,
          image: true,
        },
      },
    },
    skip,
    take,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default {
  create,
  findById,
  findByIdWithPassword,
  findByEmail,
  findByNickname,
  update,
  findUserFavoriteProducts,
  findUserFavoriteArticles,
};
