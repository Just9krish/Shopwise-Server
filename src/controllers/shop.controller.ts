import Shop from "../models/shop.model";
import Event from "../models/event.model";
import Cupon from "../models/couponCode.model";
import Product from "../models/product.model";
import Order from "../models/order.model";
import logger from "../utils/logger";
import fs from "fs";
import ErrorHandler from "../utils/errorHandler";
import sendShopToken from "../utils/shopToken";
import { NextFunction, Request, Response } from "express";
import {
  CreateCouponCodeInput,
  CreateEventInput,
  CreateShopInput,
  DeleteCouponInput,
  DeleteEventOfShopInput,
  DeleteShopSingleProductInput,
  GetAllEventOfShopInput,
  GetShopAllProductsInput,
  LoginShopInput,
  VerifyShopInput,
  UpdateOrderStatusInput,
} from "../schema/shop.schema";
import {
  createCouponCode,
  createShopAndSendVerificationEmail,
  createShopEvent,
  deleteShopSingleEvent,
  deleteShopSingleProduct,
  deleteSingleCoupon,
  getAllProductsOfShop,
  getShopDetails,
  shopLogin,
  updateOrderStatus,
  verifyShop,
} from "../services/shop.service";

const CLIENT_DOMAIN =
  process.env.NODE_ENV === "PRODUCTION"
    ? process.env.CLIENT_DOMAIN_PRO
    : process.env.CLIENT_DOMAIN_DEV;

// shop creation
export const createShopHandler = async (
  req: Request<{}, {}, CreateShopInput["body"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const shop = await createShopAndSendVerificationEmail({
      ...req.body,
    });

    res.status(200).json({
      success: true,
      message: `Verification Email Sent`,
    });
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// shop email verification or activation
export const verifyShopHanlder = async (
  req: Request<{}, {}, VerifyShopInput["body"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { verificationToken } = req.body;

    const shop = await verifyShop(verificationToken);

    sendShopToken(shop, 201, res);
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// shop login
export const shopLoginHandler = async (
  req: Request<{}, {}, LoginShopInput["body"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const shop = await shopLogin(email, password);

    sendShopToken(shop, 200, res);
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// get shop details
export const getShopDetailsHanlder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shopId = res.locals.shop._id;

    const shop = await getShopDetails(shopId);

    res.status(200).json({ success: true, shop });
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// get all products of a shop
export const getAllProductsOfShopHandler = async (
  req: Request<GetShopAllProductsInput["params"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.params;

    const products = await getAllProductsOfShop(shopId);

    res.status(200).json({ success: true, products });
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// delete sinlge product of a shop
export const deleteShopSingleProductHandler = async (
  req: Request<DeleteShopSingleProductInput["params"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const shopId = res.locals.shop._id;

    const deletedProduct = await deleteShopSingleProduct(productId, shopId);

    res.status(201).json({
      success: true,
      message: "Product deleted successfully",
      deletedProductId: deletedProduct?.id,
    });
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// create shop event
export const createEventHandler = async (
  req: Request<{}, {}, CreateEventInput["body"], CreateEventInput["files"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const shopId = res.locals.shop._id;
    const eventData = req.body.data;
    const files = req.files;

    console.log(eventData);
    console.log(files);

    // const event = createShopEvent(shopId, eventData, files);

    res.status(201).json({ success: true });
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// get shop all events
export const getAllEventsOfShopHandler = async (
  req: Request<GetAllEventOfShopInput["params"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.params;

    const events = await Event.find({ shop: shopId }).populate("shop");

    res.status(200).json({ success: true, events });
  } catch (error: any) {
    logger.error(error);
    next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// delete sinlge event of a shop
export const deleteShopSingleEventHandler = async (
  req: Request<DeleteEventOfShopInput["params"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId } = req.params;

    const result = await deleteShopSingleEvent(eventId);

    res
      .status(201)
      .json({ success: true, message: "Event deleted successfully" });
  } catch (error: any) {
    logger.error(error);
    next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// logout shop
export const logOutShopHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.cookie("seller_token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(201).json({ success: true, message: "Log out Successful!" });
  } catch (error: any) {
    logger.error(error);
    next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// create cuopon code
export const createCouponHandler = async (
  req: Request<{}, {}, CreateCouponCodeInput["body"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const shopID = res.locals.shop._id;
    const { name, minAmount, selectedProduct, value } = req.body;

    const coupon = await createCouponCode({
      name,
      value,
      minAmount,
      shopID,
      selectedProduct,
    });

    res
      .status(201)
      .json({ success: true, message: "Coupon Added Successfully" });
  } catch (error: any) {
    logger.error(error);
    next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// get shop cupons
export const getShopCouponsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shopID = res.locals.shop._id;

    const coupons = await Cupon.find({ shop: shopID });

    res.status(200).json({ success: true, coupons });
  } catch (error: any) {
    logger.error(error);
    next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// // delete single coupon
export const deleteSingleCouponHnder = async (
  req: Request<DeleteCouponInput["params"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { couponId } = req.params;
    const shopID = res.locals.shop._id;

    const coupon = await deleteSingleCoupon(couponId, shopID);

    res
      .status(200)
      .json({ success: true, message: "Coupon code deleted successfully" });
  } catch (error: any) {
    logger.error(error);
    next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// get shop all orders
export const getShopAllOrdersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shopId = res.locals.shop._id;

    const orders = await Order.find({ shop: shopId }).populate("cart.product");

    res.status(200).json({ success: true, orders });
  } catch (error: any) {
    logger.error(error);
    next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// update order status
export const updateOrderStatusHandler = async (
  req: Request<
    UpdateOrderStatusInput["params"],
    {},
    UpdateOrderStatusInput["body"]
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.orderId;
    const { orderStatus } = req.body;

    const order = await updateOrderStatus(orderId, orderStatus);

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error: any) {
    logger.error(error);
    next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};
