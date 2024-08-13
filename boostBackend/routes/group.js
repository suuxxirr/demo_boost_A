import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); 

const groupRouter = express.Router();

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

    const findGroup = await prisma.password.findUnique({
      where: {
        groupId: groupId,
      },
    });

    const realPassword = findGroup.password;// 원래 비밀번호 
  
    if (password === realPassword) {
      await prisma.group.delete({
        where: {
          id: groupId,
        },
      });
      res.status(200).send({ message: "그룹 삭제 성공"});
    } else {
      res.status(403).send({ message: "비밀번호 오류"});
    }
    
  });

export default groupRouter;