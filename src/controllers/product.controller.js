import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sort = 'latest', search = '' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        // 검색 조건
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};

        // 정렬 조건
        let orderBy;
        if (sort === 'likes') {
            orderBy = {
                likes: {
                    _count: 'desc',
                },
            };
        } else {
            orderBy = { createdAt: 'desc' };
        }

        const [totalCount, products] = await Promise.all([
            prisma.product.count({ where }),
            prisma.product.findMany({
                where,
                orderBy,
                skip,
                take: Number(limit),
                include: {
                    likes: true, // 또는 _count: { select: { likes: true } }
                },
            }),
        ]);

        res.json({
            list: products,
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
                seller: true, // 상품의 판매자 정보도 함께 가져옵니다.
                comments: true, // 상품의 댓글을 포함
                likes: true, // 상품의 좋아요를 포함
            },
        });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
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
