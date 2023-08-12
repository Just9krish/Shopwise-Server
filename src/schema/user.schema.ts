import { object, string, TypeOf, number, z } from "zod";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const createUserSchema = object({
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
    passwordConfirmation: string({
      required_error: "Password confirmation is required.",
    }),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  }),
});

export type CreateUserInput = Omit<
  TypeOf<typeof createUserSchema>,
  "body.passwordConfirmation"
>;

export const verifyUserSchema = object({
  body: object({
    verificationToken: string({
      required_error: "Verification code is required.",
    }),
  }),
});

export type VerifyUserInput = TypeOf<typeof verifyUserSchema>;

export const loginUserSchema = object({
  body: object({
    email: string({
      required_error: "Email is required.",
    }).email("Not a valid email."),
    password: string({
      required_error: "Password is required.",
    }),
  }),
});

export type LoginUserInput = TypeOf<typeof loginUserSchema>;

export const forgotPasswordSchema = object({
  body: object({
    email: string({
      required_error: "Email is required.",
    }).email("Not a valid email."),
  }),
});

export type ForgotPasswordInput = TypeOf<typeof forgotPasswordSchema>;

export const resetPasswordSchema = object({
  body: object({
    password: string({
      required_error: "Password is required.",
    }).regex(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 6 characters long."
    ),
    confirmPassword: string({
      required_error: "Password confirmation is required.",
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  }),
  params: object({
    resetToken: string({
      required_error: "Password reset token is required.",
    }),
  }),
});

export type ResetPasswordInput = TypeOf<typeof resetPasswordSchema>;

export const updateUserProfileSchema = object({
  body: object({
    name: string({
      required_error: "Name is required.",
    }),
    email: string({
      required_error: "Email is required.",
    }).email("Not a valid email"),
    password: string({
      required_error: "Password is required.",
    }),
    primaryPhoneNumber: number({
      required_error: "Primary phone number is required.",
    }),
    secondaryPhoneNumber: number(),
  }),
});

export type UpdateUserProfileInput = TypeOf<typeof updateUserProfileSchema>;

export const updateUserProfileImageSchema = object({
  file: z
    .any()
    .refine(
      (file: Express.Multer.File) => (file ? true : false),
      "Image is required."
    )
    .refine(
      (file: Express.Multer.File) =>
        ACCEPTED_IMAGE_TYPES.includes(file?.mimetype),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
});

export type UpdateUserProfileImageInput = TypeOf<
  typeof updateUserProfileImageSchema
>;

export const addUserAdressSchema = object({
  body: object({
    country: string({
      required_error: "Country is required.",
    }),
    state: string({
      required_error: "State is required.",
    }),
    address1: string({
      required_error: "Address 1  is required.",
    }),
    address2: string({
      required_error: "Address 2  is required.",
    }),
    address3: string(),
    zipcode: number({
      required_error: "Zipcode is required.",
    }),
    addressType: string({
      required_error: "Address type  is required.",
    }),
  }),
});

export type AddUserAdressInput = TypeOf<typeof addUserAdressSchema>;
