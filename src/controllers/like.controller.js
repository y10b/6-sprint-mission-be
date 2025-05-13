import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const toggleLikeForProduct = async (req, res) => {
    const { productId } = req.params;
    const userId = req.userId;

    try {
        const existing = await prisma.like.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId: Number(productId),
                },
            },
        });

        let favoriteCount;

        await prisma.$transaction(async (tx) => {
            if (existing) {
                await tx.like.delete({ where: { id: existing.id } });
            } else {
                await tx.like.create({
                    data: {
                        userId,
                        productId: Number(productId),
                    },
                });
            }

            favoriteCount = await tx.like.count({
                where: { productId: Number(productId) },
            });
        });

        return res.json({
            liked: !existing,
            favoriteCount,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '좋아요 처리 중 오류 발생' });
    }
};

export const removeLikeForProduct = async (req, res) => {
    const { productId } = req.params;
    const userId = req.userId;

    try {
        const existing = await prisma.like.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId: Number(productId),
                },
            },
        });

        if (!existing) {
            return res.status(404).json({ message: '좋아요를 찾을 수 없습니다.' });
        }

        let favoriteCount;

        await prisma.$transaction(async (tx) => {
            await tx.like.delete({ where: { id: existing.id } });
            favoriteCount = await tx.like.count({
                where: { productId: Number(productId) },
            });
        });

        res.json({
            message: '상품 좋아요가 삭제되었습니다.',
            liked: false,
            favoriteCount,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '좋아요 삭제 중 오류 발생' });
    }
};

export const toggleLikeForArticle = async (req, res) => {
    const { articleId } = req.params;
    const userId = req.userId;

    try {
        const existing = await prisma.like.findUnique({
            where: {
                userId_articleId: {
                    userId,
                    articleId: Number(articleId),
                },
            },
        });

        let favoriteCount;

        await prisma.$transaction(async (tx) => {
            if (existing) {
                await tx.like.delete({ where: { id: existing.id } });
            } else {
                await tx.like.create({
                    data: {
                        userId,
                        articleId: Number(articleId),
                    },
                });
            }

            favoriteCount = await tx.like.count({
                where: { articleId: Number(articleId) },
            });
        });

        return res.json({
            liked: !existing,
            favoriteCount,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '좋아요 처리 중 오류 발생' });
    }
};

export const removeLikeForArticle = async (req, res) => {
    const { articleId } = req.params;
    const userId = req.userId;

    try {
        const existing = await prisma.like.findUnique({
            where: {
                userId_articleId: {
                    userId,
                    articleId: Number(articleId),
                },
            },
        });

        if (!existing) {
            return res.status(404).json({ message: '좋아요를 찾을 수 없습니다.' });
        }

        let favoriteCount;

        await prisma.$transaction(async (tx) => {
            await tx.like.delete({
                where: { id: existing.id },
            });

            favoriteCount = await tx.like.count({
                where: { articleId: Number(articleId) },
            });
        });

        return res.json({
            message: '게시글 좋아요가 삭제되었습니다.',
            liked: false,
            favoriteCount,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '좋아요 삭제 중 오류 발생' });
    }
};