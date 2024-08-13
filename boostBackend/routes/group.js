import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); 

const groupRouter = express.Router();

groupRouter.route('/')
  .post(async (req, res, next) => { // 그룹 등록 
    const password = req.body.password; // 비밀 번호 저장 => 다른 비밀번호 모델에 저장하기?
    delete req.body.password;
    const group = await prisma.group.create({
      data: req.body,
    });
    if (group) {
      res.status(201).send(group); 
    } else {
      res.status(400).send({ message: "잘못된 요청입니다"});
    }
  });

export default groupRouter;