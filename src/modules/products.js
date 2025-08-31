const express = require("express");
const prisma = require("../db/prisma/client"); // prisma 클라이언트를 가져옵니다.

const productsRouter = express.Router();

/* 상품 등록 API */
productsRouter.post("/", async (req, res, next) => {
    try {
        const { name, description, price, image } = req.body;

        // 필수 필드 확인
        if (!name || !description || !price) {
            return res.status(400).json({ message: "상품명, 설명, 가격은 필수 항목입니다." });
        }

        // 새 상품 생성
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price,
                image
            }
        });

        res.status(201).json(product); // 상품 등록 성공
    } catch (e) {
        next(e);
    }
});

/* 상품 조회 API */
productsRouter.get("/:productId", async (req, res, next) => {
    try {
        const productId = Number(req.params.productId);
        if (isNaN(productId)) throw new Error("아이디는 숫자여야 합니다");

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({ message: "상품을 찾을 수 없습니다" });
        }

        res.status(200).json(product);
    } catch (e) {
        next(e);
    }
});

/* 상품 수정 API */
productsRouter.patch("/:productId", async (req, res, next) => {
    try {
        const productId = Number(req.params.productId);
        if (isNaN(productId)) throw new Error("아이디는 숫자여야 합니다");

        const { name, description, price, image } = req.body;

        // 수정할 데이터가 없으면 에러
        if (!name && !description && !price && !image) {
            return res.status(400).json({ message: "수정할 데이터를 입력해주세요" });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({ message: "상품을 찾을 수 없습니다" });
        }

        // 상품 수정
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: { name, description, price, image }
        });

        res.status(200).json(updatedProduct);
    } catch (e) {
        next(e);
    }
});

/* 상품 삭제 API */
productsRouter.delete("/:productId", async (req, res, next) => {
    try {
        const productId = Number(req.params.productId);
        if (isNaN(productId)) throw new Error("아이디는 숫자여야 합니다");

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({ message: "상품을 찾을 수 없습니다" });
        }

        await prisma.product.delete({
            where: { id: productId }
        });

        res.status(200).json({ message: "상품이 삭제되었습니다" });
    } catch (e) {
        next(e);
    }
});

// 상품 목록 조회 API
productsRouter.get("/", async (req, res, next) => {
    try {
        const { offset = 0, limit = 10, sort = "recent", search = "" } = req.query;

        // 검색 필터링
        const whereClause = search ? {
            name: {
                contains: search,
                mode: "insensitive", // 대소문자 구분 없이 검색
            }
        } : {};

        // 정렬 로직
        const orderBy = sort === "favorite"
            ? { likes: { _count: 'desc' } }
            : { createdAt: "desc" }; // 최신순 정렬

        const products = await prisma.product.findMany({
            where: whereClause,
            skip: Number(offset),
            take: Number(limit),
            orderBy: orderBy,
            include: {
                likes: true, // likes를 포함하여 좋아요 수를 구할 수 있게 함
            },
        });

        const totalCount = await prisma.product.count({ where: whereClause });

        res.status(200).json({ products, totalCount });
    } catch (e) {
        next(e);
    }
});

/* 상품에 대한 좋아요 추가 */
productsRouter.post("/:productId/like", async (req, res, next) => {
    try {
        const productId = Number(req.params.productId);
        if (isNaN(productId)) {
            return res.status(400).json({ message: "상품 ID는 숫자여야 합니다" });
        }

        // 상품이 존재하는지 확인
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({ message: "상품을 찾을 수 없습니다" });
        }

        // 이미 좋아요가 있는지 확인
        const existingLike = await prisma.like.findFirst({
            where: {
                productId: productId,
                articleId: 0, // 상품에 대한 좋아요이므로 articleId는 0으로 설정
                // 사용자 인증을 통해 현재 사용자 ID를 확인하고 비교하는 로직 추가 필요
            }
        });

        if (existingLike) {
            return res.status(400).json({ message: "이미 좋아요를 눌렀습니다" });
        }

        // 좋아요 추가
        const like = await prisma.like.create({
            data: {
                productId: productId,
                articleId: 0, // 상품 좋아요
                // 현재 사용자의 ID를 추가해야 합니다. 예: userId: req.user.id
            }
        });

        res.status(201).json({ message: "상품에 좋아요가 추가되었습니다", like });
    } catch (e) {
        next(e);
    }
});

// 상품에 대한 좋아요 삭제 API
productsRouter.delete("/:productId/like", async (req, res, next) => {
    try {
        const productId = Number(req.params.productId);
        if (isNaN(productId)) {
            return res.status(400).json({ message: "상품 ID는 숫자여야 합니다" });
        }

        // 상품이 존재하는지 확인
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({ message: "상품을 찾을 수 없습니다" });
        }

        // 좋아요가 존재하는지 확인 (사용자가 좋아요를 눌렀는지)
        const existingLike = await prisma.like.findFirst({
            where: {
                productId: productId,
                articleId: 0, // 상품에 대한 좋아요만 확인
                // 사용자 인증을 통해 현재 사용자 ID를 확인하고 비교하는 로직 추가 필요
            }
        });

        if (!existingLike) {
            return res.status(404).json({ message: "좋아요를 찾을 수 없습니다" });
        }

        // 좋아요 삭제
        await prisma.like.delete({
            where: { id: existingLike.id }
        });

        res.status(200).json({ message: "상품에 대한 좋아요가 삭제되었습니다" });
    } catch (e) {
        next(e);
    }
});

module.exports = productsRouter;
