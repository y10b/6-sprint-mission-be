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
