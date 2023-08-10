const router = require("express").Router();
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} = require("../controllers/wishlist.controller");
const { isVerify } = require("../middleware/auth");

// Add a product in whislist
router.post("/", isVerify, addToWishlist);

// Remove a product from whislist
router.delete("/:productId", isVerify, removeFromWishlist);

// Get all products from whislist
router.get("/", isVerify, getWishlist);

module.exports = router;
