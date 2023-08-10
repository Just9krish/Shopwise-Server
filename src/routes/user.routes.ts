import validate from "../middleware/validateResource";
import { createUserSchema } from "../schema/user.schema";

const router = require("express").Router();
const {
  createUser,
  activation,
  loginUser,
  getUser,
  logOutUser,
  updateUserProfile,
  updateUserProfilePicture,
  addUserAdress,
  deleteAddress,
  changePassword,
  getAllOrdersOfUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/user.controller");
const upload = require("../../uploads");
const catchAsyncError = require("../middleware/catchAsyncError");
const { isVerify } = require("../middleware/auth");

// register user
router.post("/signup", validate(createUserSchema), createUser);

// activate user
router.post("/activation", catchAsyncError(activation));

// login user
router.post("/login", catchAsyncError(loginUser));

// forgot user password
router.post("/forgotpassword", catchAsyncError(forgotPassword));

// reset user password
router.post("/resetpassword/:resetToken", catchAsyncError(resetPassword));

// logout user
router.get("/logout", catchAsyncError(logOutUser));

// retrive user information
router.get("/getuser", isVerify, catchAsyncError(getUser));

// update user
router.put("/profile", isVerify, catchAsyncError(updateUserProfile));

// update profile picture
router.put(
  "/avatar",
  isVerify,
  upload.single("file"),
  catchAsyncError(updateUserProfilePicture)
);

// add address of user
router.post("/address", isVerify, catchAsyncError(addUserAdress));

// delete user address
router.delete("/address/:addressId", isVerify, catchAsyncError(deleteAddress));

// user password change
router.post("/password-change", isVerify, catchAsyncError(changePassword));

// get all user order
router.get("/:userId/orders", isVerify, catchAsyncError(getAllOrdersOfUser));

module.exports = router;
