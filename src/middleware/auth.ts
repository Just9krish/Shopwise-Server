import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
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

      req.user = { _id: user?._id.toString() };

      next();
    } catch (error) {
      return next(new ErrorHandler("Invalid token", 401));
    }
  }
);

export const isSeller = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { seller_token } = req.cookies;

    if (!seller_token) {
      return next(new ErrorHandler("Please login to continue", 400));
    }

    try {
      const decoded: any = jwt.verify(seller_token, jwtSecret);
      req.seller = await Shop.findById(decoded.id);
      next();
    } catch (error) {
      return next(new ErrorHandler("Invalid seller token", 401));
    }
  }
);
