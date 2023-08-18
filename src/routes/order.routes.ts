import express from "express";
import { isVerify } from "../middleware/auth";
import {
  createOrderHandler,
  getOrdersHandler,
} from "../controllers/order.controller";

const router = express.Router();

// create order
router.post("/", isVerify, createOrderHandler);

// get all orders
router.get("/", getOrdersHandler);

export default router;
