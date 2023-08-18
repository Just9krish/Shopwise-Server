import mongoose, { Document, Schema } from "mongoose";
import { UserDocument } from "./user.model";
import { ProductDocument } from "./product.model";

export interface WishlistDocument extends Document {
  user: UserDocument["_id"];
  products: ProductDocument["_id"];
}

const wishlistSchema = new Schema<WishlistDocument>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  ],
});

const Wishlist = mongoose.model<WishlistDocument>("Wishlist", wishlistSchema);

export default Wishlist;
