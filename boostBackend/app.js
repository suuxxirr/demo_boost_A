import express from 'express'; 

const app = express();
app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: '테스트입니다.'});
});

app.listen(3000, () => console.log('server started'));