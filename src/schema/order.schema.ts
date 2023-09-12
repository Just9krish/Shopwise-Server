import { TypeOf, object, string } from "zod";

export const getOrderByIdSchema = object({
  params: object({
    orderId: string({ required_error: "orderId is required." }),
  }),
});

export type GetOrderByIdInput = TypeOf<typeof getOrderByIdSchema>;
