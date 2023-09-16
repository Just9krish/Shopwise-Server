import mongoose, { Document, Schema } from "mongoose";
import { ShopDocument } from "./shop.model";

export interface ProductDocument extends Document {
  name: string;
  description: string;
  category: string;
  tags?: string;
  rating?: number;
  price: number;
  discountPercentage?: number;
  discountPrice?: number;
  stock: number;
  images: any[];
  shop: ShopDocument["_id"];
  sold_out: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: [true, "Please enter product name!"],
    },
    description: {
      type: String,
      required: [true, "Please enter product description!"],
    },
    category: {
      type: String,
      required: [true, "Please enter product category!"],
    },
    tags: String,
    price: {
      type: Number,
      required: [true, "Please enter product price!"],
    },
    rating: { type: Number },
    discountPercentage: Number,
    discountPrice: Number,
    stock: {
      type: Number,
      required: [true, "Please enter the stock of product"],
    },
    images: [],
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

const Product = mongoose.model<ProductDocument>("Product", productSchema);

export default Product;
