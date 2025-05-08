import { PrismaClient } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../utils/customError.js';

const prisma = new PrismaClient();

// 모든 게시글 조회
export const getAllArticles = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sort = 'latest', search = '' } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        // 정렬 조건 설정
        let orderBy;
        if (sort === 'likes') {
            orderBy = {
                likes: {
                    _count: 'desc',
                },
            };
        } else {
            orderBy = { createdAt: 'desc' }; // 최신순 (기본)
        }

        // 검색 조건 (title, content)
        const where = search
            ? {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { content: { contains: search, mode: 'insensitive' } }
                ]
            }
            : {};

        // 전체 게시글 수
        const totalCount = await prisma.article.count({ where });

        // 게시글 목록 가져오기
        const articles = await prisma.article.findMany({
            where,
            orderBy,
            skip,
            take: Number(limit),
            include: {
                comments: true,
                likes: true,
            },
        });

        res.json({
            success: true,
            data: {
                list: articles,
                totalCount,
            }
        });
    } catch (error) {
        next(error);
    }
};


// 특정 게시글 조회
export const getArticleById = async (req, res, next) => {
    const { id } = req.params;

    try {
        const article = await prisma.article.findUnique({
            where: { id: parseInt(id) },
            include: {
                comments: true,
                likes: true,
            },
        });

        if (!article) {
            return next(new NotFoundError('Article not found'));
        }

        res.json({ success: true, data: article });
    } catch (error) {
        next(error);
    }
};

// 게시글 생성
export const createArticle = async (req, res, next) => {
    const { title, content, images } = req.body;
    const userId = req.userId;

    if (!title || !content) {
        return next(new BadRequestError('Title and content are required'));
    }

    try {
        const newArticle = await prisma.article.create({
            data: {
                title,
                content,
                images,
                user: { connect: { id: userId } },
            },
        });

        res.status(201).json({ success: true, data: newArticle });
    } catch (error) {
        next(error);
    }
};

// 게시글 수정
export const updateArticle = async (req, res) => {
    const { id } = req.params;
    const { title, content, image } = req.body;

    const article = await prisma.article.findUnique({ where: { id: Number(id) } });

    if (!article) {
        return res.status(404).json({ message: 'Article not found' });
    }

    // 요청한 유저가 해당 게시글의 작성자인지 확인
    if (article.userId !== req.userId) {
        return res.status(403).json({ message: 'You do not have permission to update this article.' });
    }

    try {
        const updatedArticle = await prisma.article.update({
            where: { id: Number(id) },
            data: { title, content, image },
        });
        res.json(updatedArticle);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update article.' });
    }
};

//게시글 삭제
export const deleteArticle = async (req, res) => {
    const { id } = req.params;

    const article = await prisma.article.findUnique({ where: { id: Number(id) } });

    if (!article) {
        return res.status(404).json({ message: 'Article not found' });
    }

    // 요청한 유저가 해당 게시글의 작성자인지 확인
    if (article.userId !== req.userId) {
        return res.status(403).json({ message: 'You do not have permission to delete this article.' });
    }

    try {
        await prisma.article.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete article.' });
    }
};