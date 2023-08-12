import validate from "../middleware/validateResource";
import {
  addUserAdressSchema,
  createUserSchema,
  forgotPasswordSchema,
  loginUserSchema,
  resetPasswordSchema,
  updateUserProfileImageSchema,
  updateUserProfileSchema,
  verifyUserSchema,
} from "../schema/user.schema";

const router = require("express").Router();
import {
  createUserHandler,
  userEmailVerificationHandler,
  loginUserHandler,
  getUserHandler,
  logOutUserHandler,
  forgotUserPasswordHandler,
  resetPasswordHandler,
  updateUserProfileHandler,
  updateUserProfilePictureHandler,
  addUserAdressHandler,
} from "../controllers/user.controller";
import upload from "../upload";
import catchAsyncError from "../middleware/catchAsyncError";
import { isVerify } from "../middleware/auth";

// register user
router.post("/signup", validate(createUserSchema), createUserHandler);

// activate user
router.post(
  "/activation",
  validate(verifyUserSchema),
  catchAsyncError(userEmailVerificationHandler)
);

// login user
router.post(
  "/login",
  validate(loginUserSchema),
  catchAsyncError(loginUserHandler)
);

// forgot user password
router.post(
  "/forgotpassword",
  validate(forgotPasswordSchema),
  catchAsyncError(forgotUserPasswordHandler)
);

// reset user password
router.post(
  "/resetpassword/:resetToken",
  validate(resetPasswordSchema),
  resetPasswordHandler
);

// logout user
router.get("/logout", catchAsyncError(logOutUserHandler));

// retrive user information
router.get("/getuser", isVerify, catchAsyncError(getUserHandler));

// update user
router.put(
  "/profile",
  isVerify,
  validate(updateUserProfileSchema),
  catchAsyncError(updateUserProfileHandler)
);

// update profile picture
router.put(
  "/avatar",
  isVerify,
  upload.single("file"),
  validate(updateUserProfileImageSchema),
  catchAsyncError(updateUserProfilePictureHandler)
);

// add address of user
router.post(
  "/address",
  isVerify,
  validate(addUserAdressSchema),
  catchAsyncError(addUserAdressHandler)
);

// // delete user address
// router.delete("/address/:addressId", isVerify, catchAsyncError(deleteAddress));

// // user password change
// router.post("/password-change", isVerify, catchAsyncError(changePassword));

// // get all user order
// router.get("/:userId/orders", isVerify, catchAsyncError(getAllOrdersOfUser));

export default router;
