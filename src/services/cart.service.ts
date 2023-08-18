import Cart, { CartDocument } from "../models/cart.model";
import Product from "../models/product.model";
import ErrorHandler from "../utils/errorHandler";

const calculateTotalPrice = (cart: CartDocument) => {
  let totalPrice = 0;

  for (const item of cart.items) {
    const productPrice = item.product.discount_price || item.product.price;
    totalPrice += productPrice * item.quantity;
  }

  return totalPrice;
};

export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<CartDocument> => {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ErrorHandler("Product not found", 404);
    }

    // Check if the user's cart already exists, if not, create a new cart
    let cart: CartDocument | null = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [], totalPrice: 0 });
    }

    // Check if the product is already in the cart, if yes, update the quantity
    const existingItem = cart.items.find((item) =>
      item.product.equals(productId)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      // If the product is not in the cart, add a new item to the cart
      cart.items.push({ product: productId, quantity });
    }

    // Save the updated cart to the database
    await cart.save();

    // Now, populate the cart with the actual product details
    cart = await Cart.findById(cart._id).populate("items.product");

    if (!cart) {
      throw new ErrorHandler("Failed to fetch cart after populating", 500);
    }

    // Calculate the total price
    cart.totalPrice = calculateTotalPrice(cart);

    // Save the cart with the updated total price
    await cart.save();

    return cart;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const removeItemFromCart = async (
  userId: string,
  productId: string
): Promise<CartDocument> => {
  try {
    // Find the user's cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new ErrorHandler("Cart not found", 404);
    }

    // Check if the product is in the cart
    const itemIndex = cart.items.findIndex((item) =>
      item.product.equals(productId)
    );
    if (itemIndex === -1) {
      throw new ErrorHandler("Item not found", 404);
    }
    // Remove the item from the cart
    cart.items.splice(itemIndex, 1);

    await cart.save();

    cart = await Cart.findById(cart._id).populate("items.product");

    if (!cart) {
      throw new ErrorHandler("Failed to fetch cart after populating", 500);
    }
    // Calculate the total price
    cart.totalPrice = calculateTotalPrice(cart);

    await cart.save();

    return cart;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const updateCartItemQuantity = async (
  cart: CartDocument,
  productId: string,
  quantity: number
): Promise<CartDocument> => {
  try {
    const existingItem = cart.items.find((item) =>
      item.product.equals(productId)
    );

    if (existingItem) {
      existingItem.quantity = quantity;

      // Save the updated cart to the database
      await cart.save();

      // Fetch the cart again and populate it
      const updatedCart = await Cart.findById(cart._id).populate(
        "items.product"
      );

      if (!updatedCart) {
        throw new ErrorHandler("Cart not found", 404);
      }

      // Calculate the total price
      updatedCart.totalPrice = calculateTotalPrice(updatedCart);

      // Save the updated cart to the database
      await updatedCart.save();

      return updatedCart;
    } else {
      throw new ErrorHandler("Item not found in cart", 404);
    }
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const getUserCart = async (
  userId: string
): Promise<CartDocument | null> => {
  try {
    // Find the cart for the user
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      // If cart doesn't exist, return null
      return null;
    }

    return cart;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};
