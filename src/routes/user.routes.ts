import validate from "../middleware/validateResource";
import {
  createUserSchema,
  forgotPasswordSchema,
  loginUserSchema,
  verifyUserSchema,
} from "../schema/user.schema";

const router = require("express").Router();
import {
  createUserHandler,
  userEmailVerificationHandler,
  loginUserHandler,
  getUserHandler,
  forgotUserPasswordHandler,
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

// // reset user password
// router.post("/resetpassword/:resetToken", catchAsyncError(resetPassword));

// // logout user
// router.get("/logout", catchAsyncError(logOutUser));

// // retrive user information
// router.get("/getuser", isVerify, catchAsyncError(getUserHandler));

// // update user
// router.put("/profile", isVerify, catchAsyncError(updateUserProfile));

// // update profile picture
// router.put(
//   "/avatar",
//   isVerify,
//   upload.single("file"),
//   catchAsyncError(updateUserProfilePicture)
// );

// // add address of user
// router.post("/address", isVerify, catchAsyncError(addUserAdress));

// // delete user address
// router.delete("/address/:addressId", isVerify, catchAsyncError(deleteAddress));

// // user password change
// router.post("/password-change", isVerify, catchAsyncError(changePassword));

// // get all user order
// router.get("/:userId/orders", isVerify, catchAsyncError(getAllOrdersOfUser));

export default router;
