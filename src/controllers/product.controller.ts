import ErrorHandler from "../utils/errorHandler";
import path from "path";
import logger from "../utils/logger";
import {
  addProduct,
  getAllProducts,
  getProductById,
} from "../services/product.service";
import { Request, Response, NextFunction } from "express";
import { GetProductInput } from "../schema/product.schema";

// add product
export const addProductHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shopId = res.locals.shop._id;
    const files = req.files as Express.Multer.File[];

    if (files === null || files === undefined || files.length === 0) {
      return next(new ErrorHandler("Please upload an image", 400));
    }

    logger.info(req.body);

    const imageUrls = files.map((file, idx) => {
      const filename = file.filename;
      const extension = path.extname(filename);
      const nameWithoutExtension = filename.slice(0, -extension.length);
      return {
        id: idx + 1,
        url: filename,
        name: nameWithoutExtension,
        type: file.mimetype,
        size: file.size,
      };
    });
    const productData = req.body;

    const product = await addProduct(productData, imageUrls, shopId);

    res.status(201).json({ success: true, product });
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// get all products
export const getAllProductsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getAllProducts(req.query);

    res.status(200).json(result);
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

export const getProductHandler = async (
  req: Request<GetProductInput["params"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;

    const product = await getProductById(productId);

    res.status(200).json({ success: true, product });
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};
