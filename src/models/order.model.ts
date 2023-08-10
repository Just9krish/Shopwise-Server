import mongoose, { Document, Schema } from "mongoose";

export interface OrderProduct {
  product: mongoose.Schema.Types.ObjectId;
  quantity: number;
}

export interface ShippingAddress {
  fullname: string;
  address1: string;
  address2: string;
  address3?: string;
  state: string;
  zipcode: string;
  country: string;
  primaryNumber: number;
  alternateNumber: number;
}

export interface PaymentInfo {
  id?: string;
  status: string;
  paymentMethod: string;
}

export interface OrderDocument extends Document {
  cart: OrderProduct[];
  shop: mongoose.Schema.Types.ObjectId;
  shippingAddress: ShippingAddress;
  user: mongoose.Schema.Types.ObjectId;
  totalPrice: number;
  orderStatus: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  paymentInfo: PaymentInfo;
  paidAt?: Date | null;
  deliveredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<OrderDocument>(
  {
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    shippingAddress: {
      fullname: {
        type: String,
        required: true,
        trim: true,
      },
      address1: {
        type: String,
        required: true,
        trim: true,
      },
      address2: {
        type: String,
        required: true,
        trim: true,
      },
      address3: String,
      state: {
        type: String,
        required: true,
        trim: true,
      },
      zipcode: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
      },
      primaryNumber: {
        type: Number,
        required: true,
      },
      alternateNumber: {
        type: Number,
        required: true,
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    orderStatus: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
      required: true,
    },
    paymentInfo: {
      id: String,
      status: {
        type: String,
        required: true,
      },
      paymentMethod: {
        type: String,
        required: true,
      },
    },
    paidAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model<OrderDocument>("Order", orderSchema);

export default Order;
