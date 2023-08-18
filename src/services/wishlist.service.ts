import Wishlist, { WishlistDocument } from "../models/wishlist.model";
import ErrorHandler from "../utils/errorHandler";

export const addToWishlist = async (
  userId: string,
  productId: string
): Promise<WishlistDocument> => {
  try {
    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    return await wishlist.populate("products");
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const removeFromWishlist = async (
  userId: string,
  productId: string
): Promise<WishlistDocument> => {
  try {
    let wishlist = await Wishlist.findOne({
      user: userId,
    });

    if (!wishlist) {
      throw new ErrorHandler("Wishlist not found", 404);
    }

    const index = wishlist.products.indexOf(productId);

    if (index === -1) {
      throw new ErrorHandler("Product not found in the wishlist", 404);
    }

    wishlist.products.splice(index, 1);
    await wishlist.save();
    return await wishlist.populate("products");
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const getWishlist = async (
  userId: string
): Promise<WishlistDocument | null> => {
  try {
    const wishlist = await Wishlist.findOne({
      user: userId,
    }).populate("products");

    return wishlist;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};
