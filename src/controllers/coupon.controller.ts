import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler";

import logger from "../utils/logger";
import { getAllCoupons, verifyCoupon } from "../services/coupon.service";
import { VerifyCouponInput } from "../schema/coupon.schema";

export const getAllCouponsCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const coupons = await getAllCoupons();

    res.status(200).json(coupons);
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

export const verifyCoupons = async (
  req: Request<{}, {}, VerifyCouponInput["body"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { couponCode, totalBill } = req.body;
    const coupon = await verifyCoupon(couponCode, totalBill);
    res.status(200).json(coupon);
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

export const appyCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { couponCode } = req.body;
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};
