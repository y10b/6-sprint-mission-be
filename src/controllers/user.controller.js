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
    const { email, encryptedPassword } = req.body; // 회원가입과 동일하게 이름 맞춤

    if (!email || !encryptedPassword) {
        return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

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

        res.json({
            accessToken,
            refreshToken,
        });

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
        // DB에서 리프레시 토큰 삭제
        await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });

        res.json({ message: '로그아웃되었습니다.' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: '로그아웃 중 오류 발생' });
    }
};