import Coupon from "../models/couponCode.model";
import Product, { ProductDocument } from "../models/product.model";
import ErrorHandler from "./errorHandler";

export interface CartWithIDandQty {
  productId: string;
  productQuantity: number;
}

const getCartItemPrice = (item: ProductDocument): number => {
  return item.discount_price || item.price;
};

const calculateCartPriceWithoutShipping = (
  cartWithIDandQty: CartWithIDandQty[],
  cartProducts: ProductDocument[]
): number => {
  let cartPrice = 0;

  for (const item of cartProducts) {
    const cartItem = cartWithIDandQty.find(
      (cartItem) => cartItem.productId === item._id.toString()
    );
    if (cartItem) {
      const itemPrice = getCartItemPrice(item) * cartItem.productQuantity;
      cartPrice += itemPrice;
    }
  }

  return cartPrice;
};

const calculateTotalAmountWithCoupon = async (
  cartPrice: number,
  couponID: string,
  cartWithIDandQty: CartWithIDandQty[],
  cartProducts: ProductDocument[]
): Promise<number> => {
  let totalAmount = cartPrice;

  if (couponID) {
    const coupon = await Coupon.findById(couponID);

    if (!coupon) {
      throw new ErrorHandler("Coupon not found", 404);
    }

    if (coupon.minAmount && cartPrice >= coupon.minAmount) {
      const eligibleItems = cartProducts.filter(
        (item) => item.shop.toString() === coupon.shop.toString()
      );

      let eligibleItemsPrice = calculateCartPriceWithoutShipping(
        cartWithIDandQty,
        eligibleItems
      );

      const discount = (coupon.value * eligibleItemsPrice) / 100;
      totalAmount -= discount;
    }
  }

  return totalAmount;
};

export const calculateTotalAmount = async (
  cartWithIDandQty: CartWithIDandQty[],
  couponID: string
): Promise<number> => {
  const productsIds = cartWithIDandQty.map((item) => item.productId);

  const cartProducts = await Product.find({ _id: { $in: productsIds } });

  const cartPrice = calculateCartPriceWithoutShipping(
    cartWithIDandQty,
    cartProducts
  );

  const shippingCharge = 15000;
  let totalAmount = cartPrice;

  if (cartPrice < 150000) {
    totalAmount += shippingCharge;
  }

  return calculateTotalAmountWithCoupon(
    totalAmount,
    couponID,
    cartWithIDandQty,
    cartProducts
  );
};
