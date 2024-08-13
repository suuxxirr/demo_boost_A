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
        groupId: group.id, // 그룹 id 가져오기 
        password: password,
      },
    })

    if (group) {
      res.status(201).send(group); 
    } else {
      res.status(400).send({ message: "잘못된 요청입니다"});
    }
  });

export default groupRouter;