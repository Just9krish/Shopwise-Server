import Order, { OrderDocument } from "../models/order.model";
import ErrorHandler from "../utils/errorHandler";

export const createOrderForShop = async (
  products: any[],
  userId: string,
  shippingAddress: any,
  calculatedPaidPrice: number,
  paymentInfo: any,
  shopId: string,
  paidAt?: Date
) => {
  try {
    const order = await Order.create({
      cart: products,
      shippingAddress,
      user: userId,
      totalPrice: calculatedPaidPrice,
      paymentInfo,
      paidAt,
      shop: shopId,
    });

    return Order.findById(order._id).populate("cart.product");
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const getAllOrders = async (): Promise<OrderDocument[]> => {
  try {
    const orders = await Order.find()
      .populate("cart.product")
      .populate("user")
      .exec();

    return orders;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};