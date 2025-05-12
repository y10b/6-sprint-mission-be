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
                            where: { userId },
                            select: { id: true },
                        }
                        : false,
                },
            }),
        ]);

        // 상품 리스트 포맷 변경: 좋아요 수와 좋아요 여부 추가
        const formattedProducts = products.map((product) => ({
            ...product,
            favoriteCount: product._count.likes, // 좋아요 수 추가
            isLiked: product.likes?.length > 0, // 해당 사용자가 좋아요를 눌렀는지 여부
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
    try {
        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
            include: {
                seller: {
                    select: {
                        nickname: true, // 판매자 닉네임만 가져오기
                    },
                },
                comments: true,
                likes: true,
            },
        });

        if (!product) return res.status(404).json({ message: 'Product not found' });

        // 응답 객체에서 닉네임만 분리해서 보내기
        const { seller, ...rest } = product;

        res.json({
            ...rest,
            sellerNickname: seller.nickname,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get product details', error });
    }
};

export const createProduct = async (req, res) => {
    const { name, description, price, imageUrl, tags } = req.body;
    const userId = req.userId; // 인증된 사용자의 ID

    try {
        const newProduct = await prisma.product.create({
            data: {
                name,
                description,
                price,
                imageUrl, // 이미지 URL을 받아서 저장
                tags, // 태그 배열을 그대로 저장
                seller: { connect: { id: userId } }, // 'seller'는 'User' 모델에 연결
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
        const product = await prisma.product.findUnique({ where: { id: Number(id) } });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // 요청한 유저가 해당 상품의 작성자인지 확인
        if (product.sellerId !== req.userId) {
            return res.status(403).json({ message: 'You do not have permission to delete this product.' });
        }

        await prisma.product.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete product.' });
    }
};
