import express from 'express'; 
import groupRouter from './routes/group.js';
import postRouter from './routes/post.js';
import commentRouter from './routes/comment.js';
import badgeRouter from './routes/badge.js';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/groups', groupRouter);
app.use('/api/posts', postRouter); 
app.use('/api/comment', commentRouter);
app.use('/api/badge', badgeRouter);

app.listen(3000, () => console.log('server started'));
