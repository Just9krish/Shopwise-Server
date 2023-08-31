import { TypeOf, object, string } from "zod";

export const addProductSchema = object({
  body: object({
    name: string({
      required_error: "Name is required",
    }),
  }),
});

export const getProductSchema = object({
  params: object({
    productId: string({
      required_error: "productId is required.",
    }),
  }),
});

export type GetProductInput = TypeOf<typeof getProductSchema>;
