import jwt from 'jsonwebtoken';
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret';

export const authenticate = (req, res, next) => {
    let token = req.cookies.accessToken;

    // Authorization 헤더에서 Bearer 토큰도 허용
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Access token이 필요합니다.' });
    }

    try {
        const payload = jwt.verify(token, ACCESS_SECRET);
        req.userId = payload.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: '유효하지 않은 access token입니다.' });
    }
};