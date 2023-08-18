import { TypeOf, object, string, number } from "zod";

export const verifyCouponSchema = object({
  body: object({
    couponCode: string({
      required_error: "Coupon code is required.",
    }),
    totalBill: number({
      required_error: "Total bill is required.",
    }),
  }),
});

export type VerifyCouponInput = TypeOf<typeof verifyCouponSchema>;
