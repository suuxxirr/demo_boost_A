import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const router = express.Router();

// 게시물 등록
router.post('/', async (req, res) => {
  const { nickname, title, imageUrl, content, tags, location, moment, isPublic, password } = req.body;

  if (!password) return res.status(400).send('Password is required');

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const post = await prisma.post.create({
      data: {
        nickname,
        title,
        imageUrl,
        content,
        tags,
        location,
        moment: new Date(moment),
        isPublic,
        password: hashedPassword,
      },
    });
    res.status(201).json({ id: post.id });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 게시물 수정
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nickname, title, imageUrl, content, tags, location, moment, isPublic, password } = req.body;

  if (!password) return res.status(400).send('Password is required');

  try {
    const post = await prisma.post.findUnique({ where: { id: Number(id) } });

    if (!post) return res.status(404).send('Post not found');

    const isMatch = await bcrypt.compare(password, post.password);
    if (!isMatch) return res.status(403).send('Invalid password');

    await prisma.post.update({
      where: { id: Number(id) },
      data: {
        nickname,
        title,
        imageUrl,
        content,
        tags,
        location,
        moment: new Date(moment),
        isPublic,
      },
    });
    res.status(200).send('Post updated successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 게시물 삭제
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) return res.status(400).send('Password is required');

  try {
    const post = await prisma.post.findUnique({ where: { id: Number(id) } });

    if (!post) return res.status(404).send('Post not found');

    const isMatch = await bcrypt.compare(password, post.password);
    if (!isMatch) return res.status(403).send('Invalid password');

    await prisma.post.delete({ where: { id: Number(id) } });
    res.status(200).send('Post deleted successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 게시글 목록 조회
router.get('/', async (req, res) => {
  const { isPublic, sortBy, search, tags } = req.query;
  const where = {};

  if (isPublic) where.isPublic = isPublic === 'true';
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { tags: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (tags) where.tags = { contains: tags, mode: 'insensitive' };

  const orderBy = sortBy === 'latest' ? { createdAt: 'desc' }
                : sortBy === 'comments' ? { _count: { comments: 'desc' } }
                : sortBy === 'likes' ? { likes: 'desc' }
                : { createdAt: 'desc' };

  try {
    const posts = await prisma.post.findMany({
      where,
      orderBy,
      include: { _count: { select: { comments: true } } },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 게시글 상세 조회
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      include: { _count: { select: { comments: true } } },
    });
    if (!post) return res.status(404).send('Post not found');
    res.json(post);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 공감 보내기
router.post('/:id/like', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.post.update({
      where: { id: Number(id) },
      data: { likes: { increment: 1 } },
    });
    res.status(200).send('Post liked successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 댓글 목록 조회
router.get('/:id/comments', async (req, res) => {
  const { id } = req.params;

  try {
    const comments = await prisma.comment.findMany({
      where: { postId: Number(id) },
      orderBy: { createdAt: 'desc' },
    });
    res.json(comments);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default router;