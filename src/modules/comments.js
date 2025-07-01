const express = require("express");
const prisma = require("../db/prisma/client");

const commentsRouter = express.Router();

/* 댓글 등록 API(게시글) */
commentsRouter.post("/articles/:articleId", async (req, res, next) => {
    const { content } = req.body;
    const { articleId } = req.params;

    // 필수 값이 모두 존재하는지 체크
    if (!content) {
        return res.status(400).json({ error: "필수 입력 필드를 채워주세요" });
    }

    // articleId가 실제로 존재하는지 확인
    const articleExists = await prisma.article.findUnique({
        where: {
            id: parseInt(articleId), // URL에서 받은 articleId를 숫자로 변환
        },
    });

    if (!articleExists) {
        return res.status(404).json({ error: "해당 게시글을 찾을 수 없습니다." });
    }

    try {
        // 새 댓글 생성
        const newComment = await prisma.comment.create({
            data: {
                content,
                articleId: parseInt(articleId), // articleId는 숫자여야 함
            },
        });

        // 댓글 생성 성공
        res.status(201).json({
            message: "댓글이 달렸습니다",
            comment: newComment,
        });
    } catch (e) {
        next(e)
    }
});

/* 댓글 수정 API */
commentsRouter.patch("/articles/:articleId/:commentId", async (req, res, next) => {
    try {
        // articleId와 commentId 파라미터를 숫자로 변환
        const articleId = Number(req.params.articleId);
        const commentId = Number(req.params.commentId);

        // articleId와 commentId가 숫자인지 확인
        if (isNaN(articleId) || isNaN(commentId)) {
            throw new Error("아이디는 숫자여야 합니다");
        }

        const { content } = req.body;

        // 수정할 내용(content)이 있는지 확인
        if (!content) {
            throw new Error("수정할 내용을 작성해 주세요");
        }

        // 해당 게시글이 존재하는지 확인
        const article = await prisma.article.findUnique({
            where: { id: articleId }
        });

        if (!article) {
            throw new Error("게시물이 없습니다");
        }

        // 해당 댓글이 존재하는지 확인
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!comment) {
            throw new Error("댓글을 찾을 수 없습니다");
        }

        // 댓글 수정
        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: { content } // 수정된 content 값으로 댓글 업데이트
        });

        // 성공적인 댓글 수정 응답
        res.status(200).json({
            message: "댓글이 수정되었습니다",
            comment: updatedComment
        });

    } catch (e) {
        next(e);
    }
});

/* 댓글 삭제 API */
commentsRouter.delete("/articles/:articleId/:commentId", async (req, res, next) => {
    try {
        const articleId = Number(req.params.articleId);
        const commentId = Number(req.params.commentId);

        // articleId와 commentId가 숫자인지 확인
        if (isNaN(articleId) || isNaN(commentId)) {
            throw new Error("아이디는 숫자여야 합니다");
        }

        // 해당 게시글이 존재하는지 확인
        const article = await prisma.article.findUnique({
            where: { id: articleId }
        });

        if (!article) {
            throw new Error("게시물이 없습니다");
        }

        // 해당 댓글이 존재하는지 확인
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!comment) {
            throw new Error("댓글을 찾을 수 없습니다");
        }

        // 댓글 삭제
        await prisma.comment.delete({
            where: { id: commentId }
        });

        // 성공적인 댓글 삭제 응답
        res.status(200).json({
            message: "댓글이 삭제되었습니다"
        });

    } catch (e) {
        next(e); // 오류는 next(e)로 전달하여 전역 오류 핸들러에서 처리
    }
});

/* 댓글 목록 조회 API (게시물)*/
commentsRouter.get("/articles/:articleId", async (req, res, next) => {
    try {
        const articleId = Number(req.params.articleId);
        const { cursor, limit = 10 } = req.query; // cursor와 limit 쿼리 파라미터 받아옴

        // articleId가 숫자인지 확인
        if (isNaN(articleId)) {
            throw new Error("아이디는 숫자여야 합니다");
        }

        // 해당 게시글이 존재하는지 확인
        const article = await prisma.article.findUnique({
            where: { id: articleId }
        });

        if (!article) {
            throw new Error("게시물이 없습니다");
        }

        // limit을 숫자로 변환하고 기본값을 설정 (최대 50개까지)
        const parsedLimit = Math.min(Number(limit), 50);

        // 커서 값이 있다면, 해당 커서 값으로 댓글을 조회
        const comments = await prisma.comment.findMany({
            where: { articleId },
            take: parsedLimit + 1, // 커서 방식에서 한 개의 추가 항목을 가져와서 "다음 페이지"가 있는지 확인
            skip: cursor ? 1 : 0, // 커서가 있다면 첫 항목을 건너뛰고, 커서부터 시작
            orderBy: {
                createdAt: "asc" // createdAt을 기준으로 오름차순 정렬
            },
            cursor: cursor ? { id: Number(cursor) } : undefined, // 커서가 있으면 해당 ID부터 조회
            select: {
                id: true,
                content: true,
                createdAt: true,
            }
        });

        // 마지막 항목이 있다면, 다음 페이지가 있는지 확인하고 nextCursor를 설정
        const hasNextPage = comments.length > parsedLimit;
        const paginatedComments = hasNextPage ? comments.slice(0, -1) : comments;

        const nextCursor = hasNextPage ? paginatedComments[paginatedComments.length - 1].id : null;

        // 결과 응답
        res.status(200).json({
            message: `${articleId}번 게시글에 달린 댓글 목록입니다.`,
            comments: paginatedComments,
            nextCursor
        });
    } catch (e) {
        next(e); // 오류는 next(e)로 전달하여 전역 오류 핸들러에서 처리
    }
});

/* ------------------------- */

/* 상품 댓글 등록 API */
commentsRouter.post("/product/:productId", async (req, res, next) => {
    const { content } = req.body;
    const { productId } = req.params;

    // 필수 값이 모두 존재하는지 체크
    if (!content) {
        return res.status(400).json({ error: "필수 입력 필드를 채워주세요" });
    }

    // productId가 실제로 존재하는지 확인
    const productExists = await prisma.product.findUnique({
        where: {
            id: parseInt(productId), // URL에서 받은 productId를 숫자로 변환
        },
    });

    if (!productExists) {
        return res.status(404).json({ error: "해당 상품을 찾을 수 없습니다." });
    }

    try {
        // 새 댓글 생성
        const newComment = await prisma.comment.create({
            data: {
                content,
                productId: parseInt(productId), // productId는 숫자여야 함
            },
        });

        // 댓글 생성 성공
        res.status(201).json({
            message: "댓글이 달렸습니다",
            comment: newComment,
        });
    } catch (e) {
        next(e)
    }
});

/* 상품 댓글 수정 API */
commentsRouter.patch("/product/:productId/:commentId", async (req, res, next) => {
    try {
        // productId와 commentId 파라미터를 숫자로 변환
        const productId = Number(req.params.productId);
        const commentId = Number(req.params.commentId);

        // productId와 commentId가 숫자인지 확인
        if (isNaN(productId) || isNaN(commentId)) {
            throw new Error("아이디는 숫자여야 합니다");
        }

        const { content } = req.body;

        // 수정할 내용(content)이 있는지 확인
        if (!content) {
            throw new Error("수정할 내용을 작성해 주세요");
        }

        // 해당 상품이 존재하는지 확인
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            throw new Error("상품이 없습니다");
        }

        // 해당 댓글이 존재하는지 확인
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!comment) {
            throw new Error("댓글을 찾을 수 없습니다");
        }

        // 댓글 수정
        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: { content } // 수정된 content 값으로 댓글 업데이트
        });

        // 성공적인 댓글 수정 응답
        res.status(200).json({
            message: "댓글이 수정되었습니다",
            comment: updatedComment
        });

    } catch (e) {
        next(e);
    }
});

/* 상품 댓글 삭제 API */
commentsRouter.delete("/product/:productId/:commentId", async (req, res, next) => {
    try {
        const productId = Number(req.params.productId);
        const commentId = Number(req.params.commentId);

        // productId와 commentId가 숫자인지 확인
        if (isNaN(productId) || isNaN(commentId)) {
            throw new Error("아이디는 숫자여야 합니다");
        }

        // 해당 상품이 존재하는지 확인
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            throw new Error("상품이 없습니다");
        }

        // 해당 댓글이 존재하는지 확인
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!comment) {
            throw new Error("댓글을 찾을 수 없습니다");
        }

        // 댓글 삭제
        await prisma.comment.delete({
            where: { id: commentId }
        });

        // 성공적인 댓글 삭제 응답
        res.status(200).json({
            message: "댓글이 삭제되었습니다"
        });

    } catch (e) {
        next(e); // 오류는 next(e)로 전달하여 전역 오류 핸들러에서 처리
    }
});

/* 상품 댓글 목록 조회 API */
commentsRouter.get("/product/:productId", async (req, res, next) => {
    try {
        const productId = Number(req.params.productId);
        const { cursor, limit = 10 } = req.query; // cursor와 limit 쿼리 파라미터 받아옴

        // productId가 숫자인지 확인
        if (isNaN(productId)) {
            throw new Error("아이디는 숫자여야 합니다");
        }

        // 해당 상품이 존재하는지 확인
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            throw new Error("상품이 없습니다");
        }

        // limit을 숫자로 변환하고 기본값을 설정 (최대 50개까지)
        const parsedLimit = Math.min(Number(limit), 50);

        // 커서 값이 있다면, 해당 커서 값으로 댓글을 조회
        const comments = await prisma.comment.findMany({
            where: { productId },
            take: parsedLimit + 1, // 커서 방식에서 한 개의 추가 항목을 가져와서 "다음 페이지"가 있는지 확인
            skip: cursor ? 1 : 0, // 커서가 있다면 첫 항목을 건너뛰고, 커서부터 시작
            orderBy: {
                createdAt: "asc" // createdAt을 기준으로 오름차순 정렬
            },
            cursor: cursor ? { id: Number(cursor) } : undefined, // 커서가 있으면 해당 ID부터 조회
            select: {
                id: true,
                content: true,
                createdAt: true,
            }
        });

        // 마지막 항목이 있다면, 다음 페이지가 있는지 확인하고 nextCursor를 설정
        const hasNextPage = comments.length > parsedLimit;
        const paginatedComments = hasNextPage ? comments.slice(0, -1) : comments;

        const nextCursor = hasNextPage ? paginatedComments[paginatedComments.length - 1].id : null;

        // 결과 응답
        res.status(200).json({
            message: `${productId}번 상품에 달린 댓글 목록입니다.`,
            comments: paginatedComments,
            nextCursor
        });
    } catch (e) {
        next(e); // 오류는 next(e)로 전달하여 전역 오류 핸들러에서 처리
    }
});


module.exports = commentsRouter;
