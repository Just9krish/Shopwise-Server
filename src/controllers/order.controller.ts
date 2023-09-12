import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler";
import Product from "../models/product.model";
import logger from "../utils/logger";
import {
  createOrderForShop,
  getAllOrders,
  getOrderById,
} from "../services/order.service";
import Cart from "../models/cart.model";
import { GetOrderByIdInput } from "../schema/order.schema";

export const createOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user._id;

    const { shippingAddress, paymentInfo } = req.body;

    let { paidPrice } = req.body;
    let paidAt;
    let isPaid = true;

    if (paidPrice) {
      paidAt = new Date();
      isPaid = true;
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return next(new ErrorHandler("Cart is  not found", 404));
    }

    const productIds = cart.items.map((item: any) => item.product);

    const cartProducts = await Product.find({ _id: { $in: productIds } });

    const shopItemsMap = new Map();

    for (const product of cartProducts) {
      const shopId = product.shop.toString();
      if (!shopItemsMap.has(shopId)) {
        shopItemsMap.set(shopId, []);
      }

      const foundItem = cart.items.find(
        (item) => item.product._id.toString() === product._id.toString()
      );

      const transformed = {
        product: product._id.toString(),
        quantity: foundItem ? foundItem.quantity : 0,
      };

      shopItemsMap.get(shopId).push(transformed);
    }

    const orders = [];

    for (const [shopId, products] of shopItemsMap) {
      const populatedOrder = await createOrderForShop(
        products,
        userId,
        shippingAddress,
        cart.totalPrice,
        paymentInfo,
        shopId,
        paidAt
      );

      orders.push(populatedOrder);
    }

    await Cart.findOneAndUpdate({ user: userId }, { items: [], totalPrice: 0 });

    res.status(201).json({ orders, totalPrice: cart.totalPrice, isPaid });
  } catch (error: any) {
    logger.error(error);
    next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

export const getOrdersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await getAllOrders();

    res.status(200).json(orders);
  } catch (error: any) {
    logger.error(error);
    next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

export const getOrderByIdHandler = async (
  req: Request<GetOrderByIdInput["params"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const userId = res.locals.user._id;

    const order = await getOrderById({ userId, orderId });

    res.status(200).json({ success: true, order });
  } catch (error: any) {
    logger.error(error);
    next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};
