import { isVerify } from "../middleware/auth";
import express from "express";
import {
  addToCartHandler,
  removeItemFromCartHandler,
  updateCartItemQuantityHandler,
  getUserCartHandler,
} from "../controllers/cart.controller";
import validate from "../middleware/validateResource";
import {
  addToCartSchema,
  removeItemFromCartSchema,
} from "../schema/cart.schema";

const router = express.Router();

// Add to cart route
router.post("/", isVerify, validate(addToCartSchema), addToCartHandler);

// Update quantity of product in cart route
router.put(
  "/update-quantity",
  isVerify,
  validate(addToCartSchema),
  updateCartItemQuantityHandler
);

// Remove the product from cart route
router.delete(
  "/:productId",
  isVerify,
  validate(removeItemFromCartSchema),
  removeItemFromCartHandler
);

// Get cart route
router.get("/", isVerify, getUserCartHandler);

export default router;
