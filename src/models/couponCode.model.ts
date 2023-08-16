import mongoose, { Document, Schema } from "mongoose";

export interface CouponCodeDocument extends Document {
  name: string;
  value: number;
  minAmount?: number;
  selectedProduct?: mongoose.Schema.Types.ObjectId;
  shop: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const couponCodeSchema = new Schema<CouponCodeDocument>(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "Please enter event product name!"],
    },
    value: {
      type: Number,
      required: true,
    },
    minAmount: Number,
    selectedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
  },
  { timestamps: true }
);

const CouponCode = mongoose.model<CouponCodeDocument>(
  "CouponCode",
  couponCodeSchema
);

export default CouponCode;
