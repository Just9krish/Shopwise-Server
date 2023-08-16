import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "config";
import ErrorHandler from "../utils/errorHandler";
import catchAsyncError from "./catchAsyncError";
import User from "../models/user.model";
import Shop from "../models/shop.model";

// const jwtSecret = config.get<string>("jwtSecret");
const jwtSecret = process.env.JWT_SECRET!;

export const isVerify = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.cookies;

    if (!token) {
      return next(new ErrorHandler("Please login to continue", 400));
    }

    try {
      const decoded: any = jwt.verify(token, jwtSecret);
      const user = await User.findById(decoded.id);

      if (user) {
        res.locals.user = { _id: user?._id };
        next();
      } else {
        return next(new ErrorHandler("Unauthorized", 401));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, error.statusCode));
    }
  }
);

export const isSeller = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { seller_token } = req.cookies;

    console.log(seller_token);
    if (!seller_token) {
      return next(new ErrorHandler("Please login to continue", 400));
    }

    try {
      const decoded: any = jwt.verify(seller_token, jwtSecret);

      const shop = await Shop.findById(decoded.id);

      if (shop) {
        res.locals.shop = { _id: shop._id };
        next();
      } else {
        return next(new ErrorHandler("Unauthorized", 401));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, error.statusCode));
    }
  }
);
