import { NextFunction, Request, Response } from "express";

import ErrorHandler from "../utils/errorHandler";
import Product from "../models/product.model";
import User from "../models/user.model";
import logger from "../utils/logger";
import { createOrderForShop, getAllOrders } from "../services/order.service";
import { calculateTotalAmount } from "../utils/calculateCartPrice";

export const createOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return next(new ErrorHandler("User is not logged in", 400));
    }

    const { cartWithIDandQty, shippingAddress, paymentInfo, couponID } =
      req.body;

    let { paidPrice } = req.body;
    let paidAt;
    let isPaid = true;
    let calculatedPaidPrice = 0; // Initialize the calculatedPaidPrice

    if (!paidPrice) {
      calculatedPaidPrice = await calculateTotalAmount(
        cartWithIDandQty,
        couponID
      ); // Calculate the cart price
      paidPrice = calculatedPaidPrice;
      isPaid = false;
    } else {
      paidAt = new Date();
      isPaid = true;
      calculatedPaidPrice = parseFloat(paidPrice); // Use the provided paidPrice
    }

    if (!cartWithIDandQty || !shippingAddress || !paidPrice || !paymentInfo) {
      return next(new ErrorHandler("Bad request", 400));
    }

    const productIds = cartWithIDandQty.map(
      (product: any) => product.productId
    );

    const cartProducts = await Product.find({ _id: { $in: productIds } });

    const shopItemsMap = new Map();

    for (const product of cartProducts) {
      const shopId = product.shop.toString();
      if (!shopItemsMap.has(shopId)) {
        shopItemsMap.set(shopId, []);
      }

      const foundItem = cartWithIDandQty.find(
        (item: any) => item.productId === product._id.toString()
      );
      const transformed = {
        product: product._id.toString(),
        quantity: foundItem ? foundItem.productQuantity : 0,
      };

      shopItemsMap.get(shopId).push(transformed);
    }

    const orders = [];

    for (const [shopId, products] of shopItemsMap) {
      const populatedOrder = await createOrderForShop(
        products,
        userId,
        shippingAddress,
        calculatedPaidPrice,
        paymentInfo,
        shopId,
        paidAt
      );

      orders.push(populatedOrder);
    }

    res.status(201).json({ orders, totalPrice: calculatedPaidPrice, isPaid });
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
