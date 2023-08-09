const router = require("express").Router();
const { isVerify } = require("../middleware/auth");
const {
  addToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  getUserCart,
} = require("../controllers/cart.controller");

// Add to cart route
router.post("/", isVerify, addToCart);

// Update quantity of product in cart route
router.put("/update-quantity", isVerify, updateCartItemQuantity);

// Remove the product from cart route
router.delete("/:productId", isVerify, removeItemFromCart);

// Get cart route
router.get("/", isVerify, getUserCart);

module.exports = router;
