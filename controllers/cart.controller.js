const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const ErrorHandler = require("../utils/errorHandler");

// calculate total price of cart items
const calculateTotalPrice = (cart) => {
  let totalPrice = 0;

  for (const item of cart.items) {
    const productPrice = item.product.discount_price || item.product.price;
    totalPrice += productPrice * item.quantity;
  }
  return totalPrice;
};

// Add to cart product
exports.addToCart = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // Check if the user's cart already exists, if not, create a new cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
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

    // Calculate the total price
    cart.totalPrice = calculateTotalPrice(cart);

    // Save the cart with the updated total price
    await cart.save();

    return res
      .status(201)
      .json({ success: true, message: "Item added to cart", cart });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler(error.message, 500));
  }
};

// Remove item from cart
exports.removeItemFromCart = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const { productId } = req.params;

    if (!productId) {
      return next(new ErrorHandler("Product id is required", 400));
    }

    // Find the user's cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return next(new ErrorHandler("Cart not found", 404));
    }

    // Check if the product is in the cart
    const itemIndex = cart.items.findIndex((item) =>
      item.product.equals(productId)
    );
    if (itemIndex === -1) {
      return next(new ErrorHandler("Item not found", 404));
    }

    // Remove the item from the cart
    cart.items.splice(itemIndex, 1);

    await cart.save();

    console.log("remove");
    cart = await Cart.findById(cart._id).populate("items.product");

    // Calculate the total price
    cart.totalPrice = calculateTotalPrice(cart);

    await cart.save();

    return res
      .status(200)
      .json({ success: true, message: "Item removed", cart });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler(error.message, 500));
  }
};

// Update item quantity in cart
exports.updateCartItemQuantity = async (req, res) => {
  const userId = req.user._id;
  try {
    const { productId, quantity } = req.body;

    // Find the user's cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return next(new ErrorHandler("Cart not found", 404));
    }

    // Check if the product is in the cart
    const existingItem = cart.items.find((item) =>
      item.product.equals(productId)
    );
    if (existingItem) {
      // Update the quantity
      existingItem.quantity = quantity;

      // Save the updated cart to the database
      await cart.save();

      cart = await Cart.findById(cart._id).populate("items.product");

      // Calculate the total price
      cart.totalPrice = calculateTotalPrice(cart);

      // Save the cart to the database
      await cart.save();

      res.status(200).json({ success: true, cart });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get cart of user
exports.getUserCart = async (req, res, next) => {
  const userId = req.user._id;

  try {
    // Find the cart for the user
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      // If cart doesn't exist, return an empty cart
      return res
        .status(200)
        .json({ success: true, cart: { items: [], totalPrice: 0 } });
    }

    return res.status(200).json({ success: true, cart });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler(error.message, 500));
  }
};
