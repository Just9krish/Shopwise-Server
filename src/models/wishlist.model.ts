import mongoose, { Document, Schema } from "mongoose";

export interface WishlistDocument extends Document {
  user: mongoose.Schema.Types.ObjectId;
  products: mongoose.Schema.Types.ObjectId[];
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
