import express, { Request, Response } from "express";
import passport from "../config/passport";
import productService from "../services/productService";
import { asyncHandler } from "../utils/asyncHandler";
import { CustomError } from "../utils/CustomError";
import { TokenUserPayload } from "../services/authService";

declare global {
  namespace Express {
    interface User extends TokenUserPayload {}
  }
}

const productController = express.Router();

productController.post(
  "/",
  passport.authenticate("access-token", {
    session: false,
    failWithError: true,
  }),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
      throw new CustomError(
        401,
        "인증되지 않은 사용자이거나 사용자 ID가 없습니다."
      );
    }
    const ownerId = req.user.id;
    if (!req.body.name || req.body.price === undefined) {
      throw new CustomError(422, "상품 이름과 가격은 필수입니다.");
    }
    const createdProduct = await productService.createProduct(
      req.body,
      ownerId
    );
    res.status(201).json(createdProduct);
  })
);

productController.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const products = await productService.getProducts(req.query, req.user?.id);
    res.json(products);
  })
);

productController.get(
  "/:productId",
  asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const product = await productService.getProductById(
      productId,
      req.user?.id
    );
    res.json(product);
  })
);

productController.patch(
  "/:productId",
  passport.authenticate("access-token", {
    session: false,
    failWithError: true,
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    if (!req.user || !req.user.id) {
      throw new CustomError(
        401,
        "인증되지 않은 사용자이거나 사용자 ID가 없습니다."
      );
    }
    const requesterId = req.user.id;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
      throw new CustomError(400, "수정할 내용이 없습니다.");
    }

    const updatedProduct = await productService.updateProduct(
      productId,
      updateData,
      requesterId
    );
    res.json(updatedProduct);
  })
);

productController.delete(
  "/:productId",
  passport.authenticate("access-token", {
    session: false,
    failWithError: true,
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    if (!req.user || !req.user.id) {
      throw new CustomError(
        401,
        "인증되지 않은 사용자이거나 사용자 ID가 없습니다."
      );
    }
    const requesterId = req.user.id;

    await productService.deleteProduct(productId, requesterId);
    res.status(204).send();
  })
);

productController.post(
  "/:productId/favorite",
  passport.authenticate("access-token", {
    session: false,
    failWithError: true,
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    if (!req.user || !req.user.id) {
      throw new CustomError(
        401,
        "인증되지 않은 사용자이거나 사용자 ID가 없습니다."
      );
    }
    const userId = req.user.id;
    const result = await productService.addFavorite(productId, userId);
    res
      .status(201)
      .json({ message: "상품을 즐겨찾기에 추가했습니다.", data: result });
  })
);

productController.delete(
  "/:productId/favorite",
  passport.authenticate("access-token", {
    session: false,
    failWithError: true,
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    if (!req.user || !req.user.id) {
      throw new CustomError(
        401,
        "인증되지 않은 사용자이거나 사용자 ID가 없습니다."
      );
    }
    const userId = req.user.id;
    await productService.removeFavorite(productId, userId);
    res.status(200).json({ message: "상품 즐겨찾기를 삭제했습니다." });
  })
);

export default productController;
