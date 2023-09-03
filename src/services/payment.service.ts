import Cart from "../models/cart.model";
import { calculateTotalAmount } from "../utils/calculateCartPrice";
import ErrorHandler from "../utils/errorHandler";
import Stripe from "stripe";

const clientStripeSecret = process.env.STRIPE_SECRET_KEY!;
const stripe = new Stripe(clientStripeSecret, { apiVersion: "2023-08-16" });

export const createPaymentIntent = async (userId: string) => {
  try {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      throw new ErrorHandler("Cart not found", 404);
    }

    const totalAmount = cart.totalPrice;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount),
      currency: "INR",
      metadata: {
        company: "Shopwise",
      },
    });

    return paymentIntent;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const getStripePublishableKey = () => {
  try {
    const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY!;
    if (!stripePublishableKey) {
      throw new ErrorHandler("Stripe publishable key not found", 500);
    }
    return stripePublishableKey;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};
