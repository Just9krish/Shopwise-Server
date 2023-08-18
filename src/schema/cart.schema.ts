import { TypeOf, number, object, string } from "zod";

export const addToCartSchema = object({
  body: object({
    productId: string({
      required_error: "Product Id is required.",
    }),
    quantity: number({
      required_error: "Quantity is required.",
    }),
  }),
});

export type AddToCartInput = TypeOf<typeof addToCartSchema>;

export const removeItemFromCartSchema = object({
  params: object({
    productId: string({
      required_error: "Product Id is required.",
    }),
  }),
});

export type RemoveItemFromCartInput = TypeOf<typeof removeItemFromCartSchema>;
