const mongoose = require("mongoose");

const shopTokenSchema = mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Seller", // Replace "Seller" with the actual name of your seller model
  },
  vToken: {
    type: String,
    default: "",
  },
  rToken: {
    type: String,
    default: "",
  },
  lToken: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("ShopToken", shopTokenSchema);
