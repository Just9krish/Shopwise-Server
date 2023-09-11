import express from "express";
import upload from "../upload";
import {
  addProductHandler,
  getAllProductsHandler,
  getBestDealProductsHandler,
  getFeaturedProductsHandler,
  getProductHandler,
} from "../controllers/product.controller";
import { isSeller } from "../middleware/auth";
import validate from "../middleware/validateResource";
import { getProductSchema } from "../schema/product.schema";

const router = express.Router();

// Reorder the route definitions
// Place the dynamic route at the end

// get all products
router.get("/", getAllProductsHandler);

// get best deal products
router.get("/best-deals", getBestDealProductsHandler);

// get featured products
router.get("/featured", getFeaturedProductsHandler);

// add product
router.post("/", isSeller, upload.array("images"), addProductHandler);

// get single product (dynamic route)
router.get("/:productId", validate(getProductSchema), getProductHandler);

export default router;
