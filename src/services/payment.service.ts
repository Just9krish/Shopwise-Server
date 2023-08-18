import { calculateTotalAmount } from "../utils/calculateCartPrice";
import ErrorHandler from "../utils/errorHandler";
import Stripe from "stripe";

const clientStripeSecret = process.env.STRIPE_SECRET_KEY!;
const stripe = new Stripe(clientStripeSecret, { apiVersion: "2023-08-16" });

export const createPaymentIntent = async (
  cartWithIDandQty: any,
  couponID: string
) => {
  try {
    if (!cartWithIDandQty || cartWithIDandQty.length === 0) {
      throw new ErrorHandler("Bad cart request", 400);
    }

    const totalAmount = await calculateTotalAmount(cartWithIDandQty, couponID);

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
