import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const commentRouter = express.Router();

commentRouter.use(express.json());

// 댓글 등록
commentRouter.post('/api/posts/:postId/comments', async (req, res) => {
    const { nickname, content, password } = req.body;
    const postId = Number(req.params.postId);

    if (!nickname || !content || !password || isNaN(postId)) {
        return res.status(400).send({ message: "잘못된 요청입니다" });
    }

    const newComment = await prisma.comment.create({
        data: {
            postId,
            nickname,
            content,
            password,
        },
    });

    if (newComment) {
        res.status(201).send(newComment);
    } else {
        res.status(400).send({ message: "댓글 등록에 실패했습니다" });
    }
});

// 댓글 목록 조회
commentRouter.get('/api/posts/:postId/comments', async (req, res) => {
    const postId = Number(req.params.postId);

    if (isNaN(postId)) {
        return res.status(400).send({ message: "잘못된 요청입니다" });
    }

    const comments = await prisma.comment.findMany({
        where: {
            postId,
        },
        select: {
            nickname: true,
            createdAt: true,
            content: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    res.status(200).send(comments);
});

// 댓글 수정
commentRouter.put('/api/comments/:commentId', async (req, res) => {
    const commentId = Number(req.params.commentId);
    const { content, password } = req.body;

    if (isNaN(commentId) || !content || !password) {
        return res.status(400).send({ message: "잘못된 요청입니다" });
    }

    const findComment = await prisma.comment.findUnique({
        where: {
            id: commentId,
        },
    });

    if (!findComment) {
        return res.status(404).send({ message: "댓글을 찾을 수 없습니다" });
    }

    if (findComment.password === password) {
        const updatedComment = await prisma.comment.update({
            where: {
                id: commentId,
            },
            data: {
                content,
            },
        });

        res.status(200).send(updatedComment);
    } else {
        res.status(403).send({ message: "비밀번호가 일치하지 않습니다" });
    }
});

// 댓글 삭제
commentRouter.delete('/api/comments/:commentId', async (req, res) => {
    const commentId = Number(req.params.commentId);
    const { password } = req.body;

    if (isNaN(commentId) || !password) {
        return res.status(400).send({ message: "잘못된 요청입니다" });
    }

    const findComment = await prisma.comment.findUnique({
        where: {
            id: commentId,
        },
    });

    if (!findComment) {
        return res.status(404).send({ message: "댓글을 찾을 수 없습니다" });
    }

    if (findComment.password === password) {
        await prisma.comment.delete({
            where: {
                id: commentId,
            },
        });

        res.status(200).send({ message: "댓글이 삭제되었습니다" });
    } else {
        res.status(403).send({ message: "비밀번호가 일치하지 않습니다" });
    }
});

export default commentRouter;

