import { TypeOf, z, array, date, number, object, string } from "zod";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const createShopSchema = object({
  body: object({
    name: string({
      required_error: "Name is required.",
    }),
    email: string({
      required_error: "Email is required.",
    }).email("Not a valid email"),
    password: string({
      required_error: "Password is required.",
    }).regex(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 6 characters long."
    ),
    confirmPassword: string({
      required_error: "Password confirmation is required.",
    }),
    zipcode: number({
      required_error: "Zipcode is required.",
    }),
    phoneNumber: number({
      required_error: "Phone number is required.",
    }),
    address: string({
      required_error: "Address is required.",
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  }),
});

export type CreateShopInput = TypeOf<typeof createShopSchema>;

export const loginShopSchema = object({
  body: object({
    email: string({
      required_error: "Email is required.",
    }).email("Not a valid email"),
    password: string({
      required_error: "Password is required.",
    }),
  }),
});

export type LoginShopInput = TypeOf<typeof loginShopSchema>;

export const verifyShopSchema = object({
  body: object({
    verificationToken: string({
      required_error: "Verification code is required.",
    }),
  }),
});

export type VerifyShopInput = TypeOf<typeof verifyShopSchema>;

export const getShopAllProductsSchema = object({
  params: object({
    shopId: string({
      required_error: "Shop id is required.",
    }),
  }),
});

export type GetShopAllProductsInput = TypeOf<typeof getShopAllProductsSchema>;

export const deleteShopSingleProductSchema = object({
  params: object({
    shopId: string({
      required_error: "Shop id is required.",
    }),
    productId: string({
      required_error: "Product id is required.",
    }),
  }),
});

export type DeleteShopSingleProductInput = TypeOf<
  typeof deleteShopSingleProductSchema
>;

// export const createEventSchema = object({
//   body: object({
//     name: string({
//       required_error: "Name is required.",
//     }),
//     description: string({
//       required_error: "Description is required.",
//     }),
//     category: string({
//       required_error: "Category is required.",
//     }),
//     tags: string(),
//     price: number({
//       required_error: "Price is required.",
//     }),
//     discountPercentage: number(),
//     discountPrice: number(),
//     stock: number({
//       required_error: "Stock is required.",
//     }),
//     startDate: date({
//       required_error: "Start date is required.",
//     }),
//     endDate: date({
//       required_error: "End date is required.",
//     }),
//   }),
//   // files: array(
//   //   object({
//   //     fieldname: string(),
//   //     originalname: string(),
//   //     encoding: string(),
//   //     mimetype: string({
//   //       required_error: "Image mimetype is required.",
//   //     }).refine((value) => ACCEPTED_IMAGE_TYPES.includes(value), {
//   //       message: ".jpg, .jpeg, .png and .webp files are accepted.",
//   //     }),
//   //   })
//   // ).refine((files) => files.length > 0, "At least one image is required."),
// });

const eventImageSchema = object({
  fieldname: string(),
  originalname: string(),
  encoding: string(),
  mimetype: string({
    required_error: "Image mimetype is required.",
  }).refine((value) => ACCEPTED_IMAGE_TYPES.includes(value), {
    message: ".jpg, .jpeg, .png and .webp files are accepted.",
  }),
});

const eventDataSchema = object({
  name: string({
    required_error: "Name is required.",
  }),
  description: string({
    required_error: "Description is required.",
  }),
  category: string({
    required_error: "Category is required.",
  }),
  tags: string(),
  price: number({
    required_error: "Price is required.",
  }),
  discountPercentage: number(),
  discountPrice: number(),
  stock: number({
    required_error: "Stock is required.",
  }),
  startDate: date({
    required_error: "Start date is required.",
  }),
  endDate: date({
    required_error: "End date is required.",
  }),
});

export const createEventSchema = object({
  body: object({ data: eventDataSchema }),
  files: array(eventImageSchema).refine(
    (files) => files.length > 0,
    "At least one image is required."
  ),
});

export type CreateEventInput = TypeOf<typeof createEventSchema>;

export const GetAllEventOfShopSchema = object({
  params: object({
    shopId: string({
      required_error: "Shop id is required.",
    }),
  }),
});

export type GetAllEventOfShopInput = TypeOf<typeof GetAllEventOfShopSchema>;

export const DeleteEventOfShopSchema = object({
  params: object({
    eventId: string({
      required_error: "Event id is required.",
    }),
  }),
});

export type DeleteEventOfShopInput = TypeOf<typeof DeleteEventOfShopSchema>;

export const CreateCouponCodeSchema = object({
  body: object({
    name: string({
      required_error: "Coupon name is required.",
    }),
    value: number({
      required_error: "Coupon value is required.",
    }),
    minAmount: number(),
    selectedProduct: string(),
  }),
});

export type CreateCouponCodeInput = TypeOf<typeof CreateCouponCodeSchema>;

export const deleteCouponScheama = object({
  params: object({
    couponId: string({
      required_error: "Coupon id is required.",
    }),
  }),
});

export type DeleteCouponInput = TypeOf<typeof deleteCouponScheama>;

enum STATUS {
  Processing = "Processing",
  Shipped = "Shipped",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
}

export const updateOrderStatusSchema = object({
  params: object({
    orderId: string({
      required_error: "Order id is required.",
    }),
  }),
  body: z.object({
    orderStatus: z.nativeEnum(STATUS),
  }),
});

export type UpdateOrderStatusInput = TypeOf<typeof updateOrderStatusSchema>;
