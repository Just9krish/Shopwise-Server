import { object, string, TypeOf } from "zod";

export const createUserSchema = object({
  body: object({
    name: string({
      required_error: "Name is required",
    }),
    email: string({
      required_error: "Email is required",
    }).email("Not a valid email"),
    password: string({
      required_error: "Password is required",
    }).min(6, "Password too short - should be 6 chars minimum"),
    passwordConfirmation: string({
      required_error: "Password confirmation is required",
    }),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
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
      required_error: "Verification code is required",
    }),
  }),
});

export type VerifyUserInput = TypeOf<typeof verifyUserSchema>;

export const loginUserSchema = object({
  body: object({
    email: string({
      required_error: "Email is required",
    }),
    password: string({
      required_error: "Password is required",
    }),
  }),
});

export type LoginUserInput = TypeOf<typeof loginUserSchema>;

export const forgotPasswordSchema = object({
  body: object({
    email: string({
      required_error: "Email is required",
    }),
  }),
});

export type ForgotPasswordInput = TypeOf<typeof forgotPasswordSchema>;
