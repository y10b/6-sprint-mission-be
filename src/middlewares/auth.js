import jwt from 'jsonwebtoken';
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret';

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: '토큰이 필요합니다.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, ACCESS_SECRET);
        req.userId = payload.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
};
