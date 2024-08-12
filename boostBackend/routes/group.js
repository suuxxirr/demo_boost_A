import express from 'express';

const groupRouter = express.Router();

groupRouter.route('/')
  .post((req, res, next) => { 
    console.log('그룹 등록'); 
    // res.json({ message: '그룹 등록'});
  })
  .get((req, res, next) => {
    res.json({ message: '그룹 목록 조회'});
  });

export default groupRouter;