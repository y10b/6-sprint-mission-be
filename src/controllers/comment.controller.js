import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 게시글에 댓글 작성
export const createCommentForArticle = async (req, res) => {
    const { content } = req.body;
    const { articleId } = req.params;
    const userId = req.userId;

    if (!content) {
        return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
    }

    try {
        const comment = await prisma.comment.create({
            data: {
                content,
                user: { connect: { id: userId } },
                article: { connect: { id: Number(articleId) } },
            },
            include: {
                user: { select: { id: true, nickname: true } },
            },
        });

        res.status(201).json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '댓글 작성 중 오류 발생' });
    }
};

// 상품에 댓글 작성
export const createCommentForProduct = async (req, res) => {
    const { content } = req.body;
    const { productId } = req.params;
    const userId = req.userId;

    if (!content) {
        return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
    }

    try {
        const comment = await prisma.comment.create({
            data: {
                content,
                user: { connect: { id: userId } },
                product: { connect: { id: Number(productId) } },
            },
            include: {
                user: { select: { id: true, nickname: true } },
            },
        });

        res.status(201).json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '댓글 작성 중 오류 발생' });
    }
};

// 댓글 수정
export const updateComment = async (req, res) => {
    const { content } = req.body;
    const commentId = Number(req.params.id);
    const userId = req.userId;

    if (!content) {
        return res.status(400).json({ message: '수정할 댓글 내용을 입력해주세요.' });
    }

    try {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }

        if (comment.userId !== userId) {
            return res.status(403).json({ message: '본인의 댓글만 수정할 수 있습니다.' });
        }

        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: { content },
        });

        res.json(updatedComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '댓글 수정 중 오류 발생' });
    }
};

// 댓글 삭제
export const deleteComment = async (req, res) => {
    const commentId = Number(req.params.id);
    const userId = req.userId;

    try {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }

        if (comment.userId !== userId) {
            return res.status(403).json({ message: '본인의 댓글만 삭제할 수 있습니다.' });
        }

        await prisma.comment.delete({
            where: { id: commentId },
        });

        res.json({ message: '댓글이 삭제되었습니다.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '댓글 삭제 중 오류 발생' });
    }
};

//상품 댓글 조회
export const getCommentsForProduct = async (req, res) => {
    const { productId } = req.params;
    const { limit = 4, cursor } = req.query;  // limit과 cursor를 query 파라미터로 받음

    try {
        const commentsQuery = {
            where: { productId: Number(productId) },
            include: {
                user: { select: { id: true, nickname: true } },
            },
            orderBy: {
                createdAt: 'desc', // 최신 댓글부터 표시
            },
            take: Number(limit), // limit 개수만큼 가져옴
        };

        if (cursor) {
            commentsQuery.cursor = { id: Number(cursor) }; // cursor가 있다면 해당 id부터 가져옴
            commentsQuery.skip = 1; // cursor는 포함하지 않기 위해 skip 1
        }

        const comments = await prisma.comment.findMany(commentsQuery);

        // 다음 커서 계산
        const nextCursor = comments.length === Number(limit) ? comments[comments.length - 1].id : null;

        res.status(200).json({
            list: comments,
            nextCursor,  // 다음 커서 전달
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '댓글 조회 중 오류 발생' });
    }
};