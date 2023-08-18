import express from "express";
import {
  createPaymentIntentHandler,
  getStripeSecretKeyHandler,
} from "../controllers/payment.controller";
import { isVerify } from "../middleware/auth";

const router = express.Router();

router.post("/create-payment-intent", isVerify, createPaymentIntentHandler);

router.get("/stripe-secret-key", getStripeSecretKeyHandler);

export default router;
