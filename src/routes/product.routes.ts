import express from "express";
import upload from "../upload";
import {
  addProductHandler,
  getAllProductsHandler,
} from "../controllers/product.controller";
import { isSeller } from "../middleware/auth";
import validate from "../middleware/validateResource";
import { getProductSchema } from "../schema/product.schema";

const router = express.Router();

// get single product
router.get("/:productId", validate(getProductSchema), getAllProductsHandler);

// add product
router.post("/", isSeller, upload.array("images"), addProductHandler);

// get all products
router.get("/", getAllProductsHandler);

export default router;
