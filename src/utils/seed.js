import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
    const pageSize = 10;
    let currentPage = 1;
    let hasMoreData = true;

    try {
        // 0. 임시 유저 생성 또는 조회
        const defaultUser = await prisma.user.upsert({
            where: { email: 'default@user.com' },
            update: {},
            create: {
                email: 'default@user.com',
                encryptedPassword: await bcrypt.hash('dummy-password', 10),
                nickname: 'DefaultUser',
            },
        });

        // 1. 상품 데이터 시딩
        while (hasMoreData) {
            const response = await axios.get(`https://panda-market-api.vercel.app/products?page=${currentPage}&limit=${pageSize}`);
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
                        imageUrl: product.images.length > 0 ? product.images[0] : null,
                        tags: product.tags, // 'tag'로 수정
                        seller: {
                            connect: { id: defaultUser.id },
                        },
                    },
                });

                const likeCount = product.favoriteCount || 0;
                const likes = Array.from({ length: likeCount }).map(() => ({
                    productId: createdProduct.id,
                    userId: defaultUser.id, // 필수!
                }));

                if (likes.length > 0) {
                    await prisma.like.createMany({
                        data: likes,
                        skipDuplicates: true,
                    });
                }
            }

            console.log(`Page ${currentPage} 시딩 완료!`);
            currentPage++;
        }

        console.log('✅ 모든 데이터 시딩 완료!');
    } catch (error) {
        console.error('❌ 시딩 중 오류 발생:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
