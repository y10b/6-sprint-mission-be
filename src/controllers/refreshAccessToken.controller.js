import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

export const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: '리프레시 토큰이 필요합니다.' });
    }

    try {
        // 토큰 유효성 확인
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);

        // DB에서 리프레시 토큰 일치 여부 확인
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: '유효하지 않은 리프레시 토큰입니다.' });
        }

        // 새 Access Token 발급
        const newAccessToken = jwt.sign({ userId: user.id }, ACCESS_SECRET, { expiresIn: '15m' });

        return res.json({ accessToken: newAccessToken });

    } catch (error) {
        console.error('Refresh error:', error);
        return res.status(403).json({ message: '토큰이 만료되었거나 유효하지 않습니다.' });
    }
};
