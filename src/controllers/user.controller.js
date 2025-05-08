import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || 'your-secret';

export const registerUser = async (req, res) => {
    const { email, password, userName } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                userName,
            },
        });
        res.status(201).json({ id: newUser.id, email: newUser.email, name: newUser.name });
    } catch (error) {
        res.status(400).json({ message: '회원가입 실패', error });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ message: '잘못된 이메일입니다.' });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });

        const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '7d' });
        res.json({ token });
    } catch (error) {
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
            name: true,
            createdAt: true,
        },
    });
    res.json(user);
};
