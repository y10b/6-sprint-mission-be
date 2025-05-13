import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sort = 'latest', keyword = '' } = req.query;
        const userId = req.userId; // 로그인된 사용자 ID
        const skip = (Number(page) - 1) * Number(limit);

        const where = keyword
            ? {
                OR: [
                    { name: { contains: keyword, mode: 'insensitive' } },
                    { description: { contains: keyword, mode: 'insensitive' } },
                ],
            }
            : {};

        // 좋아요 수를 기준으로 정렬할 때는 aggregate를 사용하여 좋아요 수를 계산합니다.
        let orderBy;
        if (sort === 'likes') {
            orderBy = [{ likes: { _count: 'desc' } }];
        } else {
            orderBy = [{ createdAt: 'desc' }]; // 최신순 정렬
        }

        const [totalCount, products] = await Promise.all([
            prisma.product.count({ where }),
            prisma.product.findMany({
                where,
                orderBy,
                skip,
                take: Number(limit),
                include: {
                    _count: {
                        select: { likes: true }, // 좋아요 수 카운트
                    },
                    likes: userId
                        ? {
                            where: { userId }, // 로그인한 사용자 기준으로 좋아요 여부 확인
                            select: { id: true },
                        }
                        : false,
                    images: true, // 이미지도 포함
                },
            }),
        ]);

        // 상품 리스트 포맷 변경: 좋아요 수, 좋아요 여부, 이미지 추가
        const formattedProducts = products.map(({ _count, likes, images, ...rest }) => ({
            ...rest,
            favoriteCount: _count.likes, // 좋아요 수
            isLiked: likes?.length > 0,  // 사용자가 좋아요 눌렀는지 여부
            images: images.map(image => image.url), // 이미지 URL 배열
        }));

        res.json({
            list: formattedProducts,
            totalCount,
        });
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
            include: {
                comments: true,
                _count: {
                    select: { likes: true }, // 좋아요 수 카운트
                },
                seller: {
                    select: { nickname: true },
                },
                images: true, // 제품 이미지도 포함
            },
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let isLiked = false;
        if (userId) {
            const like = await prisma.like.findFirst({
                where: {
                    productId: Number(id),
                    userId,
                },
            });
            isLiked = !!like; // 좋아요가 있으면 isLiked를 true로 설정
        }

        const { _count, seller, images, ...rest } = product;

        return res.json({
            ...rest,
            favoriteCount: _count.likes,  // 좋아요 수
            sellerNickname: seller.nickname, // 판매자 닉네임
            isLiked, // 사용자가 좋아요를 눌렀는지 여부
            images: images.map(image => image.url), // 이미지 URL 배열 반환
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '상품 세부 정보 조회 실패', error });
    }
};

export const createProduct = async (req, res) => {
    const { name, description, price, imageUrls, tags } = req.body; // imageUrl을 imageUrls로 변경하여 여러 이미지를 처리
    const userId = req.userId;

    try {
        const newProduct = await prisma.product.create({
            data: {
                name,
                description,
                price,
                tags, // 태그 배열을 그대로 저장
                seller: { connect: { id: userId } }, // 판매자와 유저 연결
                images: {
                    create: imageUrls.map(url => ({ url })), // 이미지 배열을 받아서 여러 이미지를 생성
                },
            },
        });
        res.status(201).json(newProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '상품 생성 실패', error });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, imageUrl, tags } = req.body;

    try {
        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // 요청한 유저가 해당 상품의 작성자인지 확인
        if (product.sellerId !== req.userId) {
            return res.status(403).json({ message: 'You do not have permission to update this product.' });
        }

        const updatedProduct = await prisma.product.update({
            where: { id: Number(id) },
            data: { name, description, price, imageUrl, tags },
        });
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update product.' });
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.sellerId !== req.userId) {
            return res.status(403).json({ message: 'You do not have permission to delete this product.' });
        }

        // 하위 데이터 먼저 삭제
        await prisma.comment.deleteMany({
            where: { productId: Number(id) },
        });

        await prisma.like.deleteMany({
            where: { productId: Number(id) },
        });

        await prisma.productImage.deleteMany({
            where: { productId: Number(id) },
        });

        // 최종적으로 Product 삭제
        await prisma.product.delete({
            where: { id: Number(id) },
        });

        res.status(204).send();
    } catch (error) {
        console.error('삭제 중 에러:', error);
        res.status(500).json({ message: 'Failed to delete product.', error });
    }
};
