import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); 

const groupRouter = express.Router();
groupRouter.use(express.json());

groupRouter.route('/')
  .post(async (req, res, next) => { // 그룹 등록 
    const {password, ...groupFields} = req.body;
  
    const group = await prisma.group.create({
      data: groupFields,
    });

    const passworRecord = await prisma.password.create({
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
      res.status(200).send(group);
    } else {
      res.status(403).send({ message: "비밀번호가 틀렸습니다"});
    }
  });

export default groupRouter;