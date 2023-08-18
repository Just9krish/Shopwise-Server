import express from "express";
import upload from "../upload";
import catchAsyncErrors from "../middleware/catchAsyncError";
import {
  addProductHandler,
  getAllProductsHandler,
} from "../controllers/product.controller";
import { isSeller } from "../middleware/auth";

const router = express.Router();

// add product
router.post(
  "/",
  isSeller,
  upload.array("images"),
  catchAsyncErrors(addProductHandler)
);

// get all products
router.get("/", catchAsyncErrors(getAllProductsHandler));

export default router;
