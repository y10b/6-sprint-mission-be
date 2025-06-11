import axios from "axios";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { execSync } from "child_process";

const prisma = new PrismaClient();

async function seed() {
  const pageSize = 10;
  let currentPage = 1;
  let hasMoreData = true;

  try {
    // 마이그레이션 먼저 실행
    console.log("데이터베이스 마이그레이션 실행 중...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.log(" 마이그레이션 완료!");

    // 0. 기본 유저 생성
    const defaultUser = await prisma.user.upsert({
      where: { email: "default@user.com" },
      update: {},
      create: {
        email: "default@user.com",
        encryptedPassword: await bcrypt.hash("dummy-password", 10),
        nickname: "DefaultUser",
      },
    });

    // 1. 상품 데이터 시딩
    while (hasMoreData) {
      const response = await axios.get(
        `https://panda-market-api.vercel.app/products?page=${currentPage}&limit=${pageSize}`
      );
      const products = response.data.list;

      if (products.length === 0) {
        hasMoreData = false;
        break;
      }

      for (const product of products) {
        const createdProduct = await prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            tags: product.tags,
            seller: { connect: { id: defaultUser.id } },
          },
        });

        // 이미지들 저장
        if (product.images && product.images.length > 0) {
          const imageData = product.images.map((url: string) => ({
            url,
            productId: createdProduct.id,
          }));

          await prisma.productImage.createMany({
            data: imageData,
            skipDuplicates: true,
          });
        }

        // 좋아요 생성 (defaultUser가 여러 번 누른 척, 중복 제거됨)
        const likeCount = product.favoriteCount || 0;

        const likeData = Array.from({ length: likeCount }).map(() => ({
          productId: createdProduct.id,
          userId: defaultUser.id,
        }));

        if (likeData.length > 0) {
          await prisma.like.createMany({
            data: likeData,
            skipDuplicates: true,
          });
        }
      }

      console.log(` Page ${currentPage} 시딩 완료!`);
      currentPage++;
    }

    console.log(" 모든 데이터 시딩 완료!");
  } catch (error) {
    console.error(" 시딩 중 오류 발생:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
