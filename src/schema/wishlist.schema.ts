import { object, string, TypeOf } from "zod";

export const addToWishlistSchema = object({
  body: object({
    productId: string({
      required_error: "Product Id is required.",
    }),
  }),
});

export type AddToWishlistInput = TypeOf<typeof addToWishlistSchema>;

export const removeFromWishlistSchema = object({
  params: object({
    productId: string({
      required_error: "Product Id is required.",
    }),
  }),
});

export type RemoveFromWishlistInput = TypeOf<typeof removeFromWishlistSchema>;
