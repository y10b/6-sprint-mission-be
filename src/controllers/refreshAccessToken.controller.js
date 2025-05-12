import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

export const refreshAccessToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken; // ✅ 쿠키에서 읽기

    if (!refreshToken) {
        return res.status(401).json({ message: '리프레시 토큰이 필요합니다.' });
    }

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: '유효하지 않은 리프레시 토큰입니다.' });
        }

        const newAccessToken = jwt.sign({ userId: user.id }, ACCESS_SECRET, { expiresIn: '15m' });

        // ✅ 쿠키 재설정
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Lax',
            maxAge: 1000 * 60 * 15,
        });

        return res.json({ message: '액세스 토큰 재발급 완료' });

    } catch (error) {
        console.error('Refresh error:', error);
        return res.status(403).json({ message: '토큰이 만료되었거나 유효하지 않습니다.' });
    }
};
