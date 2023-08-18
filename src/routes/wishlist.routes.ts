import express from "express";
import {
  addToWishlistHandler,
  removeFromWishlistHanlder,
  getWishlistHandler,
} from "../controllers/wishlist.controller";
import { isVerify } from "../middleware/auth";
import validate from "../middleware/validateResource";
import {
  addToWishlistSchema,
  removeFromWishlistSchema,
} from "../schema/wishlist.schema";

const router = express.Router();

// Add a product in whislist
router.post("/", isVerify, validate(addToWishlistSchema), addToWishlistHandler);

// Remove a product from whislist
router.delete(
  "/:productId",
  isVerify,
  validate(removeFromWishlistSchema),
  removeFromWishlistHanlder
);

// Get all products from whislist
router.get("/", isVerify, getWishlistHandler);

export default router;
