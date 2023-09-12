import express from "express";
import { isVerify } from "../middleware/auth";
import {
  createOrderHandler,
  getOrderByIdHandler,
  getOrdersHandler,
} from "../controllers/order.controller";
import validate from "../middleware/validateResource";
import { getOrderByIdSchema } from "../schema/order.schema";

const router = express.Router();

// create order
router.post("/", isVerify, createOrderHandler);

// get all orders
router.get("/", getOrdersHandler);

// get order by id
router.get(
  "/:orderId",
  isVerify,
  validate(getOrderByIdSchema),
  getOrderByIdHandler
);

export default router;
