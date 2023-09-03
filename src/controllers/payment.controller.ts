import { NextFunction, Response, Request } from "express";
import {
  createPaymentIntent,
  getStripePublishableKey,
} from "../services/payment.service";
import logger from "../utils/logger";
import ErrorHandler from "../utils/errorHandler";

export const createPaymentIntentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body;

    console.log(userId);

    const paymentIntent = await createPaymentIntent(userId);

    res
      .status(201)
      .json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    logger.error(error);
    next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

export const getStripeSecretKeyHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stripePublishableKey = getStripePublishableKey();
    res.status(200).json(stripePublishableKey);
  } catch (error: any) {
    logger.error(error);
    next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// ----------------------------------------------------------------
// {
//   "paymentIntent": {
//     "id": "pi_3N93q3SEyKqpV3Gt1yaDFmlp",
//     "object": "payment_intent",
//     "amount": 1605,
//     "amount_details": {
//       "tip": {}
//     },
//     "automatic_payment_methods": null,
//     "canceled_at": null,
//     "cancellation_reason": null,
//     "capture_method": "automatic",
//     "client_secret": "pi_3N93q3SEyKqpV3Gt1yaDFmlp_secret_ay3iBZbzUxFnV5hxZodNHojSJ",
//     "confirmation_method": "automatic",
//     "created": 1684404819,
//     "currency": "inr",
//     "description": null,
//     "last_payment_error": null,
//     "livemode": false,
//     "next_action": null,
//     "payment_method": "pm_1N93q4SEyKqpV3GtStX9BRph",
//     "payment_method_types": [
//       "card"
//     ],
//     "processing": null,
//     "receipt_email": null,
//     "setup_future_usage": null,
//     "shipping": null,
//     "source": null,
//     "status": "succeeded"
//   }
// }
