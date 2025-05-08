import express from 'express';
import cors from 'cors';
import router from './routes/index.js';
import { errorHandler } from './middlewares/error.middileware.js';
import userRouter from './routes/user.router.js';


const app = express();
const PORT = 5000;

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/users', userRouter);
app.use(router)

//에러 핸들러 제일 뒤에
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`서버가 작동 중입니다. ${PORT}`);
});
