import express from 'express';
import cors from 'cors';
import path from 'path';
import router from './routes/index.js';
import userRouter from './routes/user.route.js';
import uploadRouter from './routes/upload.route.js';
import { errorHandler } from './middlewares/error.middileware.js';

const app = express();
const PORT = 5000;

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// 정적 파일 서빙 (이미지 접근용)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 라우터 등록
app.use('/users', userRouter);
app.use('/api/upload', uploadRouter);
app.use(router);

// 에러 핸들러
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`서버가 작동 중입니다. ${PORT}`);
});
