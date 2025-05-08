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
    const { id } = req.params
    const product = await prisma.product.findUnique({ where: { id: Number(id) } })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
}

export const createProduct = async (req, res) => {
    const { name, description, price, image } = req.body
    const userId = req.userId;
    const newProduct = await prisma.product.create({
        data: { name, description, price, image, user: { connect: { id: userId } }, }
    })
    res.status(201).json(newProduct)
}

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, image } = req.body;

    const product = await prisma.product.findUnique({ where: { id: Number(id) } });

    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // 요청한 유저가 해당 상품의 작성자인지 확인
    if (product.userId !== req.userId) {
        return res.status(403).json({ message: 'You do not have permission to update this product.' });
    }

    try {
        const updatedProduct = await prisma.product.update({
            where: { id: Number(id) },
            data: { name, description, price, image },
        });
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update product.' });
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id: Number(id) } });

    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // 요청한 유저가 해당 상품의 작성자인지 확인
    if (product.userId !== req.userId) {
        return res.status(403).json({ message: 'You do not have permission to delete this product.' });
    }

    try {
        await prisma.product.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete product.' });
    }
};