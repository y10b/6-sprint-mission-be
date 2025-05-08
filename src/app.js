import express from 'express';
import cors from 'cors';


const app = express();
const PORT = 5000;

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.listen(PORT, () => {
    console.log(`서버가 작동 중입니다. ${PORT}`);
});
