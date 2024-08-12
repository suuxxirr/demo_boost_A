import express from 'express'; 
import groupRouter from './routes/group.js';

const app = express();

app.use('/api/groups', groupRouter);


app.listen(3000, () => console.log('server started'));