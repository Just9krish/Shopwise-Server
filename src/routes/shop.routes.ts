import { isSeller } from "../middleware/auth";
import validate from "../middleware/validateResource";
import upload from "../upload";
import {
  createCouponHandler,
  createEventHandler,
  createShopHandler,
  deleteShopSingleEventHandler,
  deleteShopSingleProductHandler,
  deleteSingleCouponHnder,
  getAllEventsOfShopHandler,
  getAllProductsOfShopHandler,
  getShopAllOrdersHandler,
  getShopCouponsHandler,
  getShopDetailsHanlder,
  logOutShopHandler,
  shopLoginHandler,
  updateOrderStatusHandler,
  verifyShopHanlder,
} from "../controllers/shop.controller";
import {
  CreateCouponCodeSchema,
  DeleteEventOfShopSchema,
  GetAllEventOfShopSchema,
  createEventSchema,
  createShopSchema,
  deleteCouponScheama,
  deleteShopSingleProductSchema,
  getShopAllProductsSchema,
  loginShopSchema,
  updateOrderStatusSchema,
  verifyShopSchema,
} from "../schema/shop.schema";

const router = require("express").Router();

// create a new shop
router.post("/create-shop", validate(createShopSchema), createShopHandler);

// shop activation
router.post("/activation", validate(verifyShopSchema), verifyShopHanlder);

// login shop
router.post("/login-shop", validate(loginShopSchema), shopLoginHandler);

// to logout shop
router.get("/logout", logOutShopHandler);

// to retrive shop information
router.get("/get-shop", isSeller, getShopDetailsHanlder);

// create event handlers
router.post(
  "/events",
  isSeller,
  upload.array("images"),
  validate(createEventSchema),
  createEventHandler
);

// get all events of shop
router.get(
  "/:shopId/events",
  validate(GetAllEventOfShopSchema),
  getAllEventsOfShopHandler
);

// delete shop single event
router.delete(
  "/:shopId/events/:eventId",
  isSeller,
  validate(DeleteEventOfShopSchema),
  deleteShopSingleEventHandler
);

// get all products of shop
router.get(
  "/:shopId/products",
  validate(getShopAllProductsSchema),
  getAllProductsOfShopHandler
);

// delete shop single product
router.delete(
  "/:shopId/products/:productId",
  isSeller,
  validate(deleteShopSingleProductSchema),
  deleteShopSingleProductHandler
);

// create cuopon of shop
router.post(
  "/:shopId/coupons",
  isSeller,
  validate(CreateCouponCodeSchema),
  createCouponHandler
);

// get cuopons of shops
router.get("/:shopId/coupons", isSeller, getShopCouponsHandler);

// // delete single coupon
router.delete(
  "/:shopId/coupons/:couponId",
  isSeller,
  validate(deleteCouponScheama),
  deleteSingleCouponHnder
);

// get all shop orders
router.get("/:shopId/orders", isSeller, getShopAllOrdersHandler);

// update shop order status
router.put(
  "/:shopId/orders/:orderId",
  isSeller,
  validate(updateOrderStatusSchema),
  updateOrderStatusHandler
);

export default router;
