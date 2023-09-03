import mongoose, { Document, Schema } from "mongoose";
import { ProductDocument } from "./product.model";
import { UserDocument } from "./user.model";
import { CouponCodeDocument } from "./couponCode.model";

export interface CartItem {
  product: ProductDocument["_id"];
  quantity: number;
  coupon?: CouponCodeDocument["_id"];
}

export interface CartDocument extends Document {
  user: UserDocument["_id"];
  items: CartItem[];
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const cartItemSchema = new Schema<CartItem>({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CouponCode",
  },
});

const cartSchema = new Schema<CartDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [cartItemSchema],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

const Cart = mongoose.model<CartDocument>("Cart", cartSchema);

export default Cart;
