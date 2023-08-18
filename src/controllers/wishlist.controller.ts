import { NextFunction, Response, Request } from "express";
import ErrorHandler from "../utils/errorHandler";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../services/wishlist.service";
import logger from "../utils/logger";
import {
  AddToWishlistInput,
  RemoveFromWishlistInput,
} from "../schema/wishlist.schema";

// To add a product to the wishlist
export const addToWishlistHandler = async (
  req: Request<{}, {}, AddToWishlistInput["body"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user._id;
    const { productId } = req.body;

    const wishlist = await addToWishlist(userId, productId);

    return res.status(201).json(wishlist);
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

//  To remove a product from the wishlist
export const removeFromWishlistHanlder = async (
  req: Request<RemoveFromWishlistInput["params"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const userId = res.locals.user._id;

    const wishlist = await removeFromWishlist(userId, productId);

    return res.status(200).json(wishlist);
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

export const getWishlistHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user._id;
    const wishlist = await getWishlist(userId);

    if (!wishlist) {
      return res.status(200).json({ user: userId, products: [] });
    }

    res.status(200).json(wishlist);
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};
