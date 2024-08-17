import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); 

const groupRouter = express.Router();
groupRouter.use(express.json());

groupRouter.route('/')
  .post(async (req, res, next) => { // 그룹 등록 
    const {password, ...groupFields} = req.body;
    const group = await prisma.group.create({
      data: groupFields
    });
    group.badges = [];

    await prisma.password.create({
      data: {
        groupId: group.id,  
        password: password,
      },
    })

    if (group) {
      res.status(201).send(group); 
    } else {
      res.status(400).send({ message: "잘못된 요청입니다"});
    }
  })
  .get(async (req, res) => { // 그룹 목록 조회
    const { page, pageSize, sortBy, keyword, isPublic } = req.query;
    const take = Number(pageSize);
    const skip = (Number(page)-1) * take;

    let orderBy;
    switch(sortBy){
      case 'latest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'mostPosted':
        orderBy = { postCount: 'desc' };
        break;
      case 'mostLiked':
        orderBy = { likeCount: 'desc' };
        break;
      case 'mostBadge':
        orderBy = { badgeCount: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }
    const groups = await prisma.group.findMany({
      where: {
        name: keyword ? {
          contains: keyword,
        } : undefined,
        isPublic: Boolean(isPublic),
      },
      skip,
      take,
      orderBy,
    });

    /*
    for (let i = 0; i < take; i++){ // badgeCount 붙이기 
      let groupId = groups[i].id;
      const badgeCount = await prisma.badges.count({
        where: { groupId },
      });
      groups[i].badgeCount = badgeCount;
    }
    */
  
    const totalItemCount = await prisma.group.count({
      where: {
        name: keyword ? {
          contains: keyword,
        } : undefined,
        isPublic: Boolean(isPublic),
      }
    });

    const totalPages = Math.ceil(totalItemCount / take);

    res.status(200).json({
      currentPage: Number(page),
      totalPages,
      totalItemCount,
      data: groups,
    });
  });


groupRouter.route('/:groupId')
  .delete(async (req, res, next) => { // 그룹 삭제
    const groupId = Number(req.params.groupId); 
    const password = req.body.password; // 유저가 입력한 비밀번호

    if (isNaN(groupId) || !password) {
      res.status(400).send({ message: "잘못된 요청입니다" });
    }
  
    const findGroup = await prisma.password.findUnique({
      where: {
        groupId: groupId,
      },
    });
  
    if (!findGroup) {
      res.status(404).send({ message: "존재하지 않습니다" });
    }
  
    const realPassword = findGroup.password; // 원래 비밀번호 
    if (password === realPassword) {
      await prisma.group.delete({
        where: {
          id: groupId,
        },
      });
      res.status(200).send({ message: "그룹 삭제 성공"});
    } else {
      res.status(403).send({ message: "비밀번호가 틀렸습니다"});
    }
    
  })
  .put(async (req, res) => { // 그룹 수정 
    const groupId = Number(req.params.groupId); 
    const password = req.body.password; 

    if (isNaN(groupId) || !password) {
      return res.status(400).send({ message: "잘못된 요청입니다" });
    }

    const findGroup = await prisma.password.findUnique({
      where: {
        groupId: groupId,
      },
    });

    if (!findGroup) {
      res.status(404).send({ message: "존재하지 않습니다" });
    }

    const realPassword = findGroup.password; // 원래 비밀번호 
    const { name, imageUrl, isPublic, introduction } = req.body;

    if (password === realPassword) {
      const group = await prisma.group.update({
        where: { id: groupId },
        data: { 
          name,
          imageUrl,
          isPublic,
          introduction,
         },
      });

      // badges 가져오기
      const badges = await prisma.badges.findMany({
        where: { groupId },
      });
      const badgeList = badges.map(badge => badge.badge);

      group.badges = badgeList;
      res.status(200).send(group);
    } else {
      res.status(403).send({ message: "비밀번호가 틀렸습니다"});
    }
  });

groupRouter.route('/:groupId/verify-password')
  .post(async (req, res) => { // 그룹 조회 권한 확인
    const groupId = Number(req.params.groupId); 
    const password = req.body.password;

    const findGroup = await prisma.password.findUnique({
      where: {
        groupId,
      },
    });

    const realPassword = findGroup.password;
    if (realPassword === password) {
      res.status(200).send({ message: "비밀번호가 확인되었습니다"});
    } else {
      res.status(401).send({ message: "비밀번호가 틀렸습니다"});
    }
  });

groupRouter.route('/:groupId/like')
  .post(async (req, res) => { // 그룹 공감하기
    const groupId = Number(req.params.groupId); 

    const updatedGroup = await prisma.group.update({
      where: {
        id: groupId,
      },
      data: {
        likeCount: {
          increment: 1,
        },
      },
    })

    if (!updatedGroup) {
      res.status(404).send({ message: "존재하지 않습니다"});
    } else {
      res.status(200).send({ message: "그룹 공감하기 성공"});
    }
  });

groupRouter.route('/:groupId/is-public')
  .get(async (req, res) => { // 그룹 공개 여부 확인 
    const groupId = Number(req.params.groupId);

    const getGroup = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
    });

    res.status(200).send({
      id: groupId,
      isPublic: getGroup.isPublic,
    });
  });


export default groupRouter;