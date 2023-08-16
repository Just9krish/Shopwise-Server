import mongoose, { Document, Schema } from "mongoose";
import { ShopDocument } from "./shop.model";

export interface EventDocument extends Document {
  name: string;
  description: string;
  category: string;
  startDate: Date;
  endDate: Date;
  status: string;
  tags: string;
  price: number;
  discount_percentage: number;
  discount_price: number;
  stock: number;
  images: string[];
  shop: ShopDocument["_id"];
  sold_out: number;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<EventDocument>(
  {
    name: {
      type: String,
      required: [true, "Please enter event product name!"],
    },
    description: {
      type: String,
      required: [true, "Please enter event product description!"],
    },
    category: {
      type: String,
      required: [true, "Please enter event product category!"],
    },
    startDate: {
      type: Date,
      required: [true, "Please enter event product start date!"],
    },
    endDate: {
      type: Date,
      required: [true, "Please enter event product end date!"],
    },
    status: {
      type: String,
      default: "running",
    },
    tags: String,
    price: {
      type: Number,
      required: [true, "Please enter event product price!"],
    },
    discount_percentage: {
      type: Number,
      require: true,
    },
    discount_price: { type: Number, required: true },
    stock: {
      type: Number,
      required: [true, "Please enter event the stock of product"],
    },
    images: [String],
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    sold_out: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Event = mongoose.model<EventDocument>("Event", eventSchema);

export default Event;
