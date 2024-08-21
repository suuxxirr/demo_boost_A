import express from 'express'; 
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const badgeRouter = express.Router();

// 배지 부여 로직
const checkAndAwardBadges = async (groupId) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      memories: true,
      likes: true,
    },
  });

  const today = new Date();
  const oneYearAgo = new Date(today.setFullYear(today.getFullYear() - 1));

  const badgesToAward = [];

  // 1. 7일 연속 추억 등록 확인
  const consecutiveDays = 7;
  const recentMemories = await prisma.memory.findMany({
    where: { groupId },
    orderBy: { createdAt: 'desc' },
    take: consecutiveDays
  });

  const isConsecutive = recentMemories.length === consecutiveDays && recentMemories.every((memory, index) => {
    if (index === 0) return true;
    const previousDay = new Date(recentMemories[index - 1].createdAt);
    const currentDay = new Date(memory.createdAt);
    return (previousDay - currentDay) === 24 * 60 * 60 * 1000; // 하루 차이
  });

  if (isConsecutive) {
    badgesToAward.push({ name: "7일 연속 추억 등록", description: "7일 연속으로 추억을 등록했습니다.", groupId });
  }

  // 2. 추억 수 20개 이상 등록 확인
  if (group.memories.length >= 20) {
    badgesToAward.push({ name: "추억 수 20개 이상 등록", description: "20개 이상의 추억을 등록했습니다.", groupId });
  }

  // 3. 그룹 생성 후 1년 달성 확인
  if (group.createdAt <= oneYearAgo) {
    badgesToAward.push({ name: "그룹 생성 후 1년 달성", description: "그룹이 생성된 지 1년이 지났습니다.", groupId });
  }

  // 4. 그룹 공간 1만 개 이상 받기 확인
  if (group.space && group.space >= 10000) { // `space` 컬럼이 있다고 가정
    badgesToAward.push({ name: "그룹 공간 1만 개 이상 받기", description: "1만 개 이상의 그룹 공간을 받았습니다.", groupId });
  }

  // 5. 추억 공감 1만 개 이상 받기 확인
  const totalLikes = group.likes.reduce((sum, like) => sum + like.count, 0);
  if (totalLikes >= 10000 || group.likes.some(like => like.count >= 10000)) {
    badgesToAward.push({ name: "추억 공감 1만 개 이상 받기", description: "1만 개 이상의 공감을 받았습니다.", groupId });
  }

  // 배지 저장
  for (const badge of badgesToAward) {
    await prisma.badge.create({
      data: badge
    });
  }
};

// 새로운 추억 등록 시 배지 부여 확인
badgeRouter.post('/api/groups/:groupId/memories', async (req, res) => {
    const { content } = req.body;
    const groupId = Number(req.params.groupId);

    if (!content || isNaN(groupId)) {
        return res.status(400).send({ message: "잘못된 요청입니다" });
    }

    try {
        const newMemory = await prisma.memory.create({
            data: {
                content,
                groupId,
            },
        });

        // 배지 부여 로직 실행
        await checkAndAwardBadges(groupId);

        res.status(201).send(newMemory);
    } catch (error) {
        res.status(500).send({ message: "추억 등록에 실패했습니다" });
    }
});

// 배지 목록 조회
badgeRouter.get('/api/groups/:groupId/badges', async (req, res) => {
    const groupId = Number(req.params.groupId);

    if (isNaN(groupId)) {
        return res.status(400).send({ message: "잘못된 요청입니다" });
    }

    try {
        const badges = await prisma.badge.findMany({
            where: { groupId },
            select: {
                name: true,
                description: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).send(badges);
    } catch (error) {
        res.status(500).send({ message: "배지 조회에 실패했습니다" });
    }
});

export default badgeRouter;
