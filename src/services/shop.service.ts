import { CreateShopInput } from "../schema/shop.schema";
import { createToken, hashToken } from "../utils/hashToken";
import {
  findVerificationToken,
  saveVerificationToken,
} from "./shopToken.service";
import fs from "fs";
import logger from "../utils/logger";
import sendMail from "./mail.service";
import Shop from "../models/shop.model";
import Order from "../models/order.model";
import Event from "../models/event.model";
import Cupon from "../models/couponCode.model";
import Product from "../models/product.model";
import ErrorHandler from "../utils/errorHandler";
import ShopToken from "../models/shoptoken.model";
import path from "path";

const CLIENT_DOMAIN =
  process.env.NODE_ENV === "PRODUCTION"
    ? process.env.CLIENT_DOMAIN_PRO
    : process.env.CLIENT_DOMAIN_DEV;

export const createShopAndSendVerificationEmail = async (
  input: CreateShopInput["body"]
): Promise<void> => {
  try {
    const { email, name, password, address, zipcode, phoneNumber } = input;

    const alreadyShop = await Shop.findOne({ email: email });

    if (alreadyShop) {
      throw new ErrorHandler("Shop already exists", 400);
    }

    const shop = await Shop.create({
      name: name,
      email: email,
      password: password,
      address: address,
      phoneNumber: phoneNumber,
      zipcode: zipcode,
    });

    const shopToken = await ShopToken.findOne({ shopId: shop._id });

    if (shopToken) {
      await shopToken.deleteOne();
    }

    const verificationToken = createToken(shop._id);
    const hashedToken = hashToken(verificationToken);

    await saveVerificationToken(shop._id, hashedToken);

    const verificationUrl = `${CLIENT_DOMAIN}/seller/verify/${verificationToken}`;

    const subject = "Verify Your Account - Shopwise";
    const send_to = shop.email;
    const sent_from = process.env.SMPT_MAIL!;
    const reply_to = "noreply@shopwise.com";
    const template = "verifyEmail";
    const link = verificationUrl;
    const logoUrl = process.env.SHOP_LOGO!;

    await sendMail(
      subject,
      send_to,
      sent_from,
      reply_to,
      template,
      shop.name,
      link,
      logoUrl
    );
  } catch (error: any) {
    logger.error(error);
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const verifyShop = async (verificationToken: string) => {
  try {
    const hashedToken = hashToken(verificationToken);

    const shopToken = await findVerificationToken(hashedToken);

    if (!shopToken) {
      throw new ErrorHandler("Invalid or Expired Token", 400);
    }

    const shop = await Shop.findById(shopToken.shopId);

    if (!shop) {
      throw new ErrorHandler("Shop not found", 404);
    }

    if (shop.isEmailVerified) {
      throw new ErrorHandler("Shop is already verified", 400);
    }

    shop.isEmailVerified = true;
    return await shop.save();
  } catch (error: any) {
    logger.error(error);
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const shopLogin = async (email: string, password: string) => {
  try {
    const shop = await Shop.findOne({ email }).select("+password");

    if (!shop) {
      throw new ErrorHandler("Invalid Credentials", 404);
    }

    if (!shop.isEmailVerified) {
      throw new ErrorHandler("Email is not verified", 400);
    }

    const isPasswordValid = await shop.comparePassword(password);

    if (!isPasswordValid) {
      throw new ErrorHandler("Invalid Credentials", 400);
    }

    return shop;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const getShopDetails = async (shopId: string) => {
  try {
    const shop = await Shop.findById(shopId);

    if (!shop) {
      throw new ErrorHandler("Shop doesn't exist", 404);
    }

    return shop;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const getAllProductsOfShop = async (shopId: string) => {
  try {
    const products = await Product.find({ shop: shopId }).populate("shop");

    return products;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const deleteShopSingleProduct = async (
  productId: string,
  shopId: string
) => {
  try {
    const product = await Product.findById(productId);

    if (!product) {
      throw new ErrorHandler("Product does not exist", 404);
    }

    if (!product.shop.equals(shopId)) {
      throw new ErrorHandler(
        "Unauthorized: Product does not belong to your shop",
        403
      );
    }

    const imageDeletionPromises = product.images.map(async (image) => {
      const filepath = path.resolve(`uploads/${image.name}`);
      console.log(filepath)
      try {
        await fs.promises.unlink(filepath);
      } catch (err: any) {
        throw new ErrorHandler(err.message, 500);
      }
    });

    await Promise.all(imageDeletionPromises);

    const deletedProduct = await Product.findByIdAndDelete(productId);
    return deletedProduct;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

interface CreateEventInput {
  name: string;
  description: string;
  shop?: string;
  images?: string[];
  startDate: Date;
  endDate: Date;
  price: number;
  discountPercentage?: number;
  discountPrice?: number;
  stock: number;
  tags?: string;
}

export const createShopEvent = async (
  sellerId: string,
  eventData: CreateEventInput,
  files: Express.Multer.File[]
) => {
  try {
    const shop = await Shop.findById(sellerId);

    if (!shop) {
      throw new ErrorHandler("Invalid Shop id", 400);
    }

    const imageUrls = files.map((file) => `${file.filename}`);
    eventData.images = imageUrls;
    eventData.shop = shop._id;

    const event = await Event.create(eventData);
    return event;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const deleteShopSingleEvent = async (eventId: string, shopId: string) => {
  try {

    const eventData = await Event.findById(eventId);

    if(!eventData) {
      throw new ErrorHandler("Event does not exist", 404)
    }

    if(eventData.shop.toString() !== shopId){
      throw new ErrorHandler("Event does not belong to your shop", 403)
    }

    // Delete event images
    if (eventData) {
      await Promise.all(
        eventData.images.map((image) => {
          const filepath = `uploads/${image}`;

          fs.unlink(filepath, (err: any) => {
            logger.error(err);
            throw new ErrorHandler(err.message, 500);
          });
        })
      );
    }

    const event = await Event.findByIdAndDelete(eventId);

    if (!event) {
      throw new ErrorHandler("Event does not exist", 404);
    }

    return event;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const createCouponCode = async ({
  shopID,
  name,
  value,
  minAmount = 0,
  selectedProduct,
}: {
  name: string;
  shopID: string;
  value: number;
  minAmount?: number;
  selectedProduct?: string;
}) => {
  try {
    const shop = await Shop.findById(shopID);

    if (!shop) {
      throw new ErrorHandler("Invalid Shop id", 400);
    }

    const cuoponcode = await Cupon.findOne({ name });

    if (cuoponcode) {
      throw new ErrorHandler("Cupon code already exists", 400);
    }

    const product = await Product.findById(selectedProduct);

    if (!product) {
      throw new ErrorHandler("Invalid Product id", 400);
    }

    const newCuopon = await Cupon.create({
      name,
      shop: shop._id,
      value,
      minAmount,
      selectedProduct,
    });

    return newCuopon;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const deleteSingleCoupon = async (
  couponId: string,
  sellerId: string
) => {
  try {
    const couponData = await Cupon.findById(couponId);

    if (!couponData) {
      throw new ErrorHandler("Coupon not found", 404);
    }

    if (couponData.shop.toString() !== sellerId) {
      throw new ErrorHandler("You are not allowed to perform this action", 400);
    }

    const coupon = await Cupon.findByIdAndDelete(couponId);

    return coupon;
  } catch (error: any) {
    logger.error(error);
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

async function updateProductStockAndSoldOut(id: string, quantity: number) {
  const product = await Product.findById(id);
  if (!product) {
    throw new ErrorHandler("Product not found", 404);
  }
  product.stock = product.stock - quantity;
  product.sold_out = product.sold_out + quantity;
  await product.save({ validateBeforeSave: false });
}

export const updateOrderStatus = async (
  orderId: string,
  orderStatus: "Processing" | "Shipped" | "Delivered" | "Cancelled"
) => {
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new ErrorHandler("Order does not exist", 404);
    }

    if (order.orderStatus === orderStatus) {
      throw new ErrorHandler(`Order is already in "${orderStatus}"`, 400);
    }

    if (orderStatus === "Shipped") {
      for (const item of order.cart) {
        await updateProductStockAndSoldOut(
          item.product.toString(),
          item.quantity
        );
      }
    }

    order.orderStatus = orderStatus;

    if (orderStatus === "Delivered") {
      order.deliveredAt = new Date();
      order.paymentInfo.status = "succeeded";
    }

    return await order.save({ validateBeforeSave: false });
  } catch (error: any) {
    logger.error(error);
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};
