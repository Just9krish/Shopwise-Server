import ErrorHandler from "../utils/errorHandler";
import Coupon from "../models/couponCode.model";
import formattedPrice from "../utils/fromatPrice";

export const getAllCoupons = async () => {
  try {
    const coupons = await Coupon.find();
    return coupons;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const verifyCoupon = async (couponCode: string, totalBill: number) => {
  try {
    const coupon = await Coupon.findOne({ name: couponCode }).populate("shop");

    if (!coupon) {
      throw new ErrorHandler("Coupon code is not valid", 400);
    }

    if (coupon.minAmount) {
      const minAmount = coupon.minAmount;
      if (totalBill < minAmount) {
        throw new ErrorHandler(
          `Purchase should be equal or more than ${formattedPrice(minAmount)}`,
          400
        );
      }
    }

    return coupon;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};
