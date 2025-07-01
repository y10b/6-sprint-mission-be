const express = require("express");
const prisma = require("../db/prisma/client");

const articlesRouter = express.Router();

/* 게시글 등록 API */
articlesRouter.post('/', async (req, res, next) => {
    try {
        const { title, content, images } = req.body; // images 추가

        if (!title || !content) {
            return res.status(400).json({ message: "제목과 내용을 입력하세요" });
        }

        const article = await prisma.article.create({
            data: {
                title,
                content,
                images // images 필드 추가
            }
        });

        res.status(201).json(article); // 등록 성공 status 201
    } catch (e) {
        next(e);
    }
});

/* 게시글 조회 */
articlesRouter.get('/:articleId', async (req, res, next) => {
    try {
        const articleId = Number(req.params.articleId);
        if (isNaN(articleId)) throw new Error("아이디는 숫자여야 합니다");

        const article = await prisma.article.findUnique({
            where: { id: articleId },
            include: {
                likes: true, // 좋아요 정보를 포함하도록 수정
            },
        });

        if (!article) throw new Error("게시글을 찾을 수 없습니다");

        res.status(200).json({
            ...article,
            likesCount: article.likes.length, // 좋아요 수를 계산해서 포함
        });
    } catch (e) {
        next(e);
    }
});


/* 게시글 수정 */
articlesRouter.patch('/:articleId', async (req, res, next) => {
    try {
        const articleId = Number(req.params.articleId);
        if (isNaN(articleId)) throw new Error("아이디는 숫자여야 합니다");

        const { title, content, images } = req.body; // 수정할 데이터 받기

        if (!title && !content && !images) {
            return res.status(400).json({ message: "제목, 내용, 또는 이미지 중 하나는 입력해야 합니다" });
        }

        const article = await prisma.article.findUnique({
            where: { id: articleId },
        });

        if (!article) {
            return res.status(404).json({ message: "게시글을 찾을 수 없습니다" });
        }

        const updatedArticle = await prisma.article.update({
            where: { id: articleId },
            data: {
                title,
                content,
                images // images 필드 업데이트
            },
        });

        res.status(200).json(updatedArticle);
    } catch (e) {
        next(e);
    }
});

/* 게시글 삭제 */
articlesRouter.delete('/:articleId', async (req, res, next) => {
    try {
        const articleId = Number(req.params.articleId);
        if (isNaN(articleId)) throw new Error("아이디는 숫자여야 합니다");

        const article = await prisma.article.findUnique({
            where: { id: articleId },
        });

        if (!article) {
            return res.status(404).json({ message: "게시글을 찾을 수 없습니다" });
        }

        await prisma.article.delete({
            where: { id: articleId },
        });

        res.status(200).json({ message: "게시글이 삭제되었습니다" });
    } catch (e) {
        next(e);
    }
});

/* 게시글 목록(전체) 조회 */
articlesRouter.get('/', async (req, res, next) => {
    try {
        const skip = Number(req.query.offset);
        const search = req.query.search;
        const options = {};
        options.orderBy = { createdAt: "desc" };

        if (skip) options.skip = skip;
        if (search) options.where = { OR: [{ title: { contains: search } }, { content: { contains: search } }] };

        const articles = await prisma.article.findMany({
            ...options,
            select: { id: true, title: true, content: true, createdAt: true, images: true }
        });

        res.status(200).json(articles);
    } catch (e) {
        next(e);
    }
});

/* 게시글에 좋아요 추가 API */
articlesRouter.post("/:articleId/like", async (req, res, next) => {
    try {
        const articleId = Number(req.params.articleId);
        if (isNaN(articleId)) {
            return res.status(400).json({ message: "게시글 ID는 숫자여야 합니다" });
        }

        const article = await prisma.article.findUnique({
            where: { id: articleId }
        });

        if (!article) {
            return res.status(404).json({ message: "게시글을 찾을 수 없습니다" });
        }

        // 좋아요가 이미 있는지 확인 (articleId에 대한 좋아요 확인)
        const existingLike = await prisma.likeToArticle.findFirst({
            where: {
                articleId: articleId,
                // 사용자 인증을 통해 현재 사용자 ID를 확인하고 비교하는 로직 추가 필요
            }
        });

        if (existingLike) {
            return res.status(400).json({ message: "이미 좋아요를 눌렀습니다" });
        }

        const like = await prisma.likeToArticle.create({
            data: {
                articleId: articleId,
                // 현재 사용자의 ID를 추가해야 합니다. 예: userId: req.user.id
            }
        });

        res.status(201).json({ message: "게시글에 좋아요가 추가되었습니다", like });
    } catch (e) {
        next(e);
    }
});

/* 게시글에 대한 좋아요 삭제 API */
articlesRouter.delete("/:articleId/like", async (req, res, next) => {
    try {
        const articleId = Number(req.params.articleId);
        if (isNaN(articleId)) {
            return res.status(400).json({ message: "게시글 ID는 숫자여야 합니다" });
        }

        const article = await prisma.article.findUnique({
            where: { id: articleId }
        });

        if (!article) {
            return res.status(404).json({ message: "게시글을 찾을 수 없습니다" });
        }

        // 좋아요가 존재하는지 확인
        const existingLike = await prisma.likeToArticle.findFirst({
            where: {
                articleId: articleId,
                // 사용자 인증을 통해 현재 사용자 ID를 확인하고 비교하는 로직 추가 필요
            }
        });

        if (!existingLike) {
            return res.status(404).json({ message: "좋아요를 찾을 수 없습니다" });
        }

        await prisma.likeToArticle.delete({
            where: { id: existingLike.id }
        });

        res.status(200).json({ message: "게시글에 대한 좋아요가 삭제되었습니다" });
    } catch (e) {
        next(e);
    }
});

module.exports = articlesRouter;
