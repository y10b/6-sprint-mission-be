export const validateProductInput = (req, res, next) => {
    const { name, description, price } = req.body;

    // 이름 검증: 문자열 + 길이 2~14자
    if (
        !name ||
        typeof name !== 'string' ||
        name.trim().length < 2 ||
        name.trim().length >= 15
    ) {
        return res.status(400).json({ message: '상품 이름은 2자 이상 15자 미만의 문자열이어야 합니다.' });
    }

    // 설명 검증: 문자열 + 길이 10~99자
    if (
        !description ||
        typeof description !== 'string' ||
        description.trim().length < 10 ||
        description.trim().length >= 100
    ) {
        return res.status(400).json({ message: '상품 설명은 10자 이상 100자 미만의 문자열이어야 합니다.' });
    }

    // 가격 검증: 숫자 + 양수
    if (
        price === undefined ||
        typeof price !== 'number' ||
        isNaN(price) ||
        price <= 0
    ) {
        return res.status(400).json({ message: '상품 가격은 양의 숫자여야 합니다.' });
    }

    next();
};
