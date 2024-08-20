import express from 'express'; 
import groupRouter from './routes/group.js';
import postRouter from './routes/post.js';

const app = express();
app.use(express.json());

app.use('/api/groups', groupRouter);
app.use('/api/posts', postRouter); 

app.listen(3000, () => console.log('server started'));