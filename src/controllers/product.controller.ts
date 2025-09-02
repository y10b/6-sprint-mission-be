import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";
import {
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
} from "../utils/customError";

const productService = new ProductService();

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, sort = "latest", keyword = "" } = req.query;
    const userId = req.userId;

    const result = await productService.getAllProducts(
      Number(page),
      Number(limit),
      sort as string,
      keyword as string,
      userId
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const product = await productService.getProductById(Number(id), userId);

    if (!product) {
      res.status(404).json({ message: "상품을 찾을 수 없습니다." });
      return;
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedError("로그인이 필요합니다.");
    }

    const product = await productService.createProduct(req.body, userId);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedError("로그인이 필요합니다.");
    }

    const product = await productService.updateProduct(
      Number(id),
      req.body,
      userId
    );
    res.json(product);
  } catch (error: unknown) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      next(error);
    } else {
      next(new Error("알 수 없는 에러가 발생했습니다."));
    }
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedError("로그인이 필요합니다.");
    }

    await productService.deleteProduct(Number(id), userId);
    res.status(204).send();
  } catch (error: unknown) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      next(error);
    } else {
      next(new Error("알 수 없는 에러가 발생했습니다."));
    }
  }
};
