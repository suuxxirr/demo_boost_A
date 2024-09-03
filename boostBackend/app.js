import express from 'express'; 
import groupRouter from './routes/group.js';
import postRouter from './routes/post.js';
import commentRouter from './routes/comment.js';
import badgeRouter from './routes/badge.js';
import cors from 'cors';

const app = express();

// CORS 설정
app.use(cors());
// app.use(cors({
//   origin: '*',
//   methods: 'GET,POST,PUT,DELETE',
//   allowedHeaders: 'Content-Type,Authorization',
//   credentials: true,
// }));

app.use(express.json());

// CORS preflight 요청 허용
app.options('*', cors());

app.use('/api/groups', groupRouter);
app.use('/api/posts', postRouter); 
app.use('/api/comments', commentRouter);
app.use('/api/badges', badgeRouter);

app.get('/', (req, res) => {
  res.send('test');
});

app.listen(process.env.PORT || 3000, () => console.log('server started'));
