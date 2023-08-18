import { object, string } from "zod";

export const addProductSchema = object({
  body: object({
    name: string({
      required_error: "Name is required",
    }),
  }),
});
