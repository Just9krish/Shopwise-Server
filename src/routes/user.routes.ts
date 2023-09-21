import validate from "../middleware/validateResource";
import {
  addUserAdressSchema,
  changeUserPasswordSchema,
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
  deleteAddressHandler,
  changeUserPasswordHandler,
  getUserOrdersHandler,
} from "../controllers/user.controller";
import upload from "../upload";
import { isVerify } from "../middleware/auth";

// register user
router.post("/signup", validate(createUserSchema), createUserHandler);

// activate user
router.post(
  "/activation",
  validate(verifyUserSchema),
  userEmailVerificationHandler
);

// login user
router.post(
  "/login",
  validate(loginUserSchema),
  loginUserHandler
);

// forgot user password
router.post(
  "/forgotpassword",
  validate(forgotPasswordSchema),
  forgotUserPasswordHandler
);

// reset user password
router.post(
  "/resetpassword/:resetToken",
  validate(resetPasswordSchema),
  resetPasswordHandler
);

// logout user
router.get("/logout", logOutUserHandler);

// retrive user information
router.get("/getuser", isVerify, getUserHandler);

// update user
router.put(
  "/profile",
  isVerify,
  validate(updateUserProfileSchema),
  updateUserProfileHandler
);

// update profile picture
router.put(
  "/avatar",
  isVerify,
  upload.single("file"),
  validate(updateUserProfileImageSchema),
  updateUserProfilePictureHandler
);

// add address of user
router.post(
  "/address",
  isVerify,
  validate(addUserAdressSchema),
  addUserAdressHandler
);

// delete user address
router.delete("/address/:addressId", isVerify, deleteAddressHandler);

// user password change
router.post(
  "/password-change",
  isVerify,
  validate(changeUserPasswordSchema),
  changeUserPasswordHandler
);

// get all user order
router.get("/:userId/orders", isVerify, getUserOrdersHandler);

export default router;
