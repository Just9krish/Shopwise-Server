import mongoose from "mongoose";

export interface ShopTokenDocument extends Document {
  shopId: mongoose.Schema.Types.ObjectId;
  vToken?: string;
  rToken?: string;
  lToken?: string;
  createdAt: Date;
  expiresAt: Date;
}

const shopTokenSchema = new mongoose.Schema<ShopTokenDocument>({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Shop",
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

const ShopToken = mongoose.model<ShopTokenDocument>(
  "ShopToken",
  shopTokenSchema
);

export default ShopToken;
