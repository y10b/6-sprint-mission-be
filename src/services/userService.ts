import userRepository from "../repositories/userRepository";
import productRepository from "../repositories/productRepository";
import articleRepository from "../repositories/articleRepository";
import bcrypt from "bcrypt";
import { User, Product, Article, Prisma } from "@prisma/client";
import { CustomError } from "../utils/CustomError";

type SafeUser = Omit<User, "password">;

async function getUserProfile(userId: number): Promise<SafeUser> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new CustomError(404, "사용자를 찾을 수 없습니다.");
  }
  return user;
}

type UserProfileUpdateData = Partial<Pick<User, "nickname" | "image">>;

async function updateUserProfile(
  userId: number,
  updateData: UserProfileUpdateData
): Promise<SafeUser> {
  const allowedUpdates: (keyof UserProfileUpdateData)[] = ["nickname", "image"];
  const filteredUpdateData: UserProfileUpdateData = {};

  for (const key of allowedUpdates) {
    if (updateData[key] !== undefined) {
      const value = updateData[key];

      const valueToAssign = value === null ? undefined : value;
      filteredUpdateData[key] = valueToAssign;
    }
  }

  if (Object.keys(filteredUpdateData).length === 0) {
    throw new CustomError(400, "수정할 유효한 정보가 없습니다.");
  }

  if (
    typeof filteredUpdateData.nickname === "string" &&
    filteredUpdateData.nickname
  ) {
    const existingUserByNickname = await userRepository.findByNickname(
      filteredUpdateData.nickname
    );
    if (existingUserByNickname && existingUserByNickname.id !== userId) {
      throw new CustomError(409, "이미 사용중인 닉네임입니다.");
    }
  }

  const updatedUser = await userRepository.update(
    userId,
    filteredUpdateData as Prisma.UserUpdateInput
  );
  return updatedUser;
}

async function updateUserPassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await userRepository.findByIdWithPassword(userId);
  if (!user) {
    throw new CustomError(404, "사용자를 찾을 수 없습니다.");
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new CustomError(401, "현재 비밀번호가 일치하지 않습니다.");
  }

  if (newPassword.length < 8) {
    throw new CustomError(422, "새 비밀번호는 최소 8자 이상이어야 합니다.");
  }
  if (currentPassword === newPassword) {
    throw new CustomError(422, "새 비밀번호는 현재 비밀번호와 달라야 합니다.");
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await userRepository.update(userId, {
    password: hashedNewPassword,
  } as Prisma.UserUpdateInput);
}

interface QueryParams {
  page?: string | number;
  pageSize?: string | number;
  orderBy?: string;
  keyword?: string;
  [key: string]: any;
}

async function getUserProducts(
  userId: number,
  queryParams: QueryParams
): Promise<any> {
  const prismaQueryParams: Prisma.ProductFindManyArgs = {
    where: { ownerId: userId },
  };
  if (queryParams.page && queryParams.pageSize) {
    prismaQueryParams.skip =
      (Number(queryParams.page) - 1) * Number(queryParams.pageSize);
    prismaQueryParams.take = Number(queryParams.pageSize);
  }
  return productRepository.findAll(prismaQueryParams, userId);
}

async function getUserFavorites(
  userId: number,
  queryParams: QueryParams
): Promise<{ products: any[]; articles: any[] }> {
  const options = {
    skip:
      queryParams.page && queryParams.pageSize
        ? (Number(queryParams.page) - 1) * Number(queryParams.pageSize)
        : undefined,
    take: queryParams.pageSize ? Number(queryParams.pageSize) : undefined,
  };

  const favoriteProducts = await userRepository.findUserFavoriteProducts(
    userId,
    options
  );
  const favoriteArticles = await userRepository.findUserFavoriteArticles(
    userId,
    options
  );
  return { products: favoriteProducts, articles: favoriteArticles };
}

async function getUserById(id: number): Promise<SafeUser | null> {
  const user = await userRepository.findById(id);
  return user;
}

export default {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  getUserProducts,
  getUserFavorites,
  getUserById,
};
