import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

const createAccessToken = (user) =>
    jwt.sign({ userId: user.id }, ACCESS_SECRET, { expiresIn: '15m' });

const createRefreshToken = (user) =>
    jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

export const registerUser = async (req, res) => {
    const { email, encryptedPassword, nickname } = req.body;

    if (!email || !encryptedPassword || !nickname) {
        return res.status(400).json({ message: '이메일, 비밀번호, 닉네임을 모두 입력해주세요.' });
    }

    try {
        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail) {
            return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });
        }

        const existingNickname = await prisma.user.findUnique({ where: { nickname } });
        if (existingNickname) {
            return res.status(409).json({ message: '이미 사용 중인 닉네임입니다.' });
        }

        const hashedPassword = await bcrypt.hash(encryptedPassword, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                encryptedPassword: hashedPassword,
                nickname,
            },
        });

        const accessToken = createAccessToken(newUser);
        const refreshToken = createRefreshToken(newUser);

        await prisma.user.update({
            where: { id: newUser.id },
            data: { refreshToken },
        });
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Lax',
            maxAge: 1000 * 60 * 15, // 15분
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Lax',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
        });

        res.status(201).json({
            id: newUser.id,
            email: newUser.email,
            nickname: newUser.nickname,
        });

    } catch (error) {
        res.status(500).json({ message: '회원가입 실패', error });
    }
};

export const loginUser = async (req, res) => {
    const { email, encryptedPassword } = req.body;

    if (!email || !encryptedPassword) {
        return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: '잘못된 이메일입니다.' });
        }

        const isValid = await bcrypt.compare(encryptedPassword, user.encryptedPassword);
        if (!isValid) {
            return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });
        }

        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        // ✅ 쿠키 설정
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 15, // 15분
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
        });

        res.json({ message: '로그인 성공' });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: '로그인 실패', error });
    }
};
export const getMyProfile = async (req, res) => {
    const userId = req.userId;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            nickname: true,
            createdAt: true,
        },
    });
    res.json(user);
};

export const logoutUser = async (req, res) => {
    const userId = req.userId;

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });

        // ✅ 쿠키 삭제
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.json({ message: '로그아웃되었습니다.' });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: '로그아웃 중 오류 발생' });
    }
};