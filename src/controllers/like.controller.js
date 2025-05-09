import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 게시글 좋아요
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

        if (existing) {
            await prisma.like.delete({ where: { id: existing.id } });
            return res.json({ liked: false });
        } else {
            await prisma.like.create({
                data: {
                    userId,
                    articleId: Number(articleId),
                },
            });
            return res.json({ liked: true });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '좋아요 처리 중 오류 발생' });
    }
};

// 상품 좋아요
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

        if (existing) {
            await prisma.like.delete({ where: { id: existing.id } });
            return res.json({ liked: false });
        } else {
            await prisma.like.create({
                data: {
                    userId,
                    productId: Number(productId),
                },
            });
            return res.json({ liked: true });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '좋아요 처리 중 오류 발생' });
    }
};

// 게시글 좋아요 삭제
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

        await prisma.like.delete({
            where: { id: existing.id },
        });

        res.json({ message: '게시글 좋아요가 삭제되었습니다.', liked: false });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '좋아요 삭제 중 오류 발생' });
    }
};

// 상품 좋아요 삭제
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

        await prisma.like.delete({
            where: { id: existing.id },
        });

        res.json({ message: '상품 좋아요가 삭제되었습니다.', liked: false });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '좋아요 삭제 중 오류 발생' });
    }
};
