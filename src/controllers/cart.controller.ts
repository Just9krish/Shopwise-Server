import Cart from "../models/cart.model";
import { NextFunction, Request, Response } from "express";
import {
  addToCart,
  getUserCart,
  removeItemFromCart,
  updateCartItemQuantity,
} from "../services/cart.service";
import ErrorHandler from "../utils/errorHandler";
import logger from "../utils/logger";
import { AddToCartInput, RemoveItemFromCartInput } from "../schema/cart.schema";

// Add to cart product
export const addToCartHandler = async (
  req: Request<{}, {}, AddToCartInput["body"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user._id;
    const { productId, quantity } = req.body;

    const cart = await addToCart(userId, productId, quantity);

    return res
      .status(201)
      .json({ success: true, message: "Item added to cart", cart });
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// Remove item from cart
export const removeItemFromCartHandler = async (
  req: Request<RemoveItemFromCartInput["params"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user._id;
    const { productId } = req.params;

    const cart = await removeItemFromCart(userId, productId);

    return res
      .status(200)
      .json({ success: true, message: "Item removed", cart });
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// Update item quantity in cart
export const updateCartItemQuantityHandler = async (
  req: Request<{}, {}, AddToCartInput["body"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user._id;
    const { productId, quantity } = req.body;

    // Find the user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return next(new ErrorHandler("Cart not found", 404));
    }

    // Update cart item quantity
    const updatedCart = await updateCartItemQuantity(cart, productId, quantity);

    res.status(200).json({ success: true, cart: updatedCart });
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// Get cart of user
export const getUserCartHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user._id;

    const cart = await getUserCart(userId);

    if (cart === null) {
      return res.status(200).json({ success: true, cart: null });
    }

    return res.status(200).json({ success: true, cart });
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};
