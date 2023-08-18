import express from "express";
import {
  getAllCouponsCode,
  verifyCoupons,
} from "../controllers/coupon.controller";
import { isVerify } from "../middleware/auth";
import validate from "../middleware/validateResource";
import { verifyCouponSchema } from "../schema/coupon.schema";

const router = express.Router();

router.get("/", getAllCouponsCode);

router.post("/", isVerify, validate(verifyCouponSchema), verifyCoupons);

export default router;
