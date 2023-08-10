const Wishlist = require("../models/wishlist.model");
const ErrorHandler = require("../utils/errorHandler");

// To add a product to the wishlist
exports.addToWishlist = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const { productId } = req.body;

    // Find the wishlist for the user
    let wishlist = await Wishlist.findOne({ user: userId });

    // If wishlist doesn't exist, create a new one
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    // Add the product to the wishlist if it's not already in the list
    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    await wishlist.populate("products");

    return res.status(201).json(wishlist);
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};

//  To remove a product from the wishlist
exports.removeFromWishlist = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const { productId } = req.params;
    // Find the wishlist for the user
    let wishlist = await Wishlist.findOne({
      user: userId,
    });

    // If wishlist doesn't exist, return an error
    if (!wishlist) {
      return next(new ErrorHandler("Wishlist not found", 404));
    }

    // Find the index of the product in the wishlist
    const index = wishlist.products.indexOf(productId);

    // If the product is not in the wishlist, return an error
    if (index === -1) {
      return next(new ErrorHandler("Product not found in the wishlist", 404));
    }

    // Remove the product from the wishlist
    wishlist.products.splice(index, 1);
    await wishlist.save();

    // Populate the products field with actual product documents
    await wishlist.populate("products");

    return res.status(200).json(wishlist);
  } catch (error) {
    console.log(error);
    next(new ErrorHandler(error.message, 500));
  }
};

exports.getWishlist = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const wishlist = await Wishlist.findOne({
      user: userId,
    }).populate("products");

    if (!wishlist) {
      return res.status(200).json({ user: userId, products: [] });
    }

    res.status(200).json(wishlist);
  } catch (error) {
    console.log(error);
    next(new ErrorHandler(error.message, 500));
  }
};
