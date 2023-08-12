import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import Order from "../models/order.model";
import Token from "../models/usertoken.model";
import ErrorHandler from "../utils/errorHandler";
import sendToken from "../utils/jwtToken";
import logger from "../utils/logger";
import config from "config";
import {
  AddUserAdressInput,
  CreateUserInput,
  ForgotPasswordInput,
  LoginUserInput,
  ResetPasswordInput,
  UpdateUserProfileInput,
  VerifyUserInput,
} from "../schema/user.schema";
import {
  addUserAddress,
  createUserAndSendVerificationEmail,
  forgotPasswordByUserEmail,
  getUserDetailsById,
  loginUserAndSetCookie,
  resetUserPassword,
  updateUserProfile,
  updateUserProfileImage,
  verifyUserEmail,
} from "../services/user.service";

// interface AuthenticatedRequest extends Request {
//   user: { id: string }; // Define the user property with the appropriate type
// }

// const CLIENT_DOMAIN =
//   config.get<string>("nodeEnv") === "PRODUCTION"
//     ? config.get<string>("clientDomainProd")
//     : config.get<string>("clientDomainDev");

const CLIENT_DOMAIN =
  process.env.NODE_ENV === "PRODUCTION"
    ? process.env.CLIENT_DOMAIN_PROD
    : process.env.CLIENT_DOMAIN_DEV;

// register user
export const createUserHandler = async (
  req: Request<{}, {}, CreateUserInput["body"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    const result = await createUserAndSendVerificationEmail({
      email: email,
      password: password,
      name: name,
    });

    res.status(201).json(result);
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler("Something went wrong", 500));
  }
};

// activate user account
export const userEmailVerificationHandler = async (
  req: Request<{}, {}, VerifyUserInput["body"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { verificationToken } = req.body;

    const user = await verifyUserEmail(verificationToken);

    sendToken(user, 200, res);
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler("Something went wrong", 500));
  }
};

// login user
export const loginUserHandler = async (
  req: Request<{}, {}, LoginUserInput["body"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await loginUserAndSetCookie({ email, password });

    sendToken(user, 200, res);
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// get user information
export const getUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user._id;

    const user = await getUserDetailsById(userId);

    res.status(200).json({ success: true, user });
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// forgot password
export const forgotUserPasswordHandler = async (
  req: Request<{}, {}, ForgotPasswordInput["body"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    await forgotPasswordByUserEmail(email);

    res.status(200).json({ message: "Password Reset Email Sent" });
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// reset user password
export const resetPasswordHandler = async (
  req: Request<ResetPasswordInput["params"], {}, ResetPasswordInput["body"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;

    const user = await resetUserPassword(resetToken, password);

    res
      .status(200)
      .json({ message: "Password Reset Successful, please login" });
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// log out user
export const logOutUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(201).json({ success: true, message: "Log out Successful!" });
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// update user profile
export const updateUserProfileHandler = async (
  req: Request<{}, {}, UpdateUserProfileInput["body"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user._id;
    const { email, password, primaryPhoneNumber, secondaryPhoneNumber, name } =
      req.body;

    const user = await updateUserProfile({
      userId,
      email,
      password,
      primaryPhoneNumber,
      secondaryPhoneNumber,
      name,
    });

    res.status(200).json({ success: true, user });
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// update user profile picture
export const updateUserProfilePictureHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user._id;
    const file = req.file!;

    console.log(file);

    const user = await updateUserProfileImage(userId, file);

    res.status(201).json({ success: true, user });
  } catch (error: any) {
    logger.error(error);
    return next(new ErrorHandler(error.message, error.statusCode || 500));
  }
};

// add user address
export const addUserAdressHandler = async (
  req: Request<{}, {}, AddUserAdressInput["body"]>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user._id;
    const {
      country,
      state,
      address1,
      address2,
      address3,
      zipcode,
      addressType,
    } = req.body;

    const user = addUserAddress(
      userId,
      country,
      state,
      address1,
      address2,
      address3,
      zipcode,
      addressType
    );

    res.status(201).json({ message: "Address added successfully", user });
  } catch (error: any) {
    console.error(error);
    next(new ErrorHandler(error.message, 500));
  }
};

// // user can delete address
// exports.deleteAddress = async (req, res, next) => {
//   try {
//     const userId = req.user.id;

//     const user = await User.findById(userId);

//     if (!user) {
//       return next(new ErrorHandler("User not found", 404));
//     }

//     const addressId = req.params.addressId;

//     const address = user.addresses.find((address) => address._id == addressId);

//     if (!address) {
//       return next(new ErrorHandler("Address not found", 404));
//     }

//     user.addresses.pull(addressId);

//     await user.save();

//     res.status(201).json({ message: "Address deleted successfully", user });
//   } catch (error) {
//     console.error(error);
//     next(new ErrorHandler(error.message, 500));
//   }
// };

// // user change password
// exports.changePassword = async (req, res, next) => {
//   try {
//     const { oldPassword, newPassword, confirmNewPassword } = req.body;

//     const userId = req.user.id;

//     const user = await User.findById(userId).select("+password");

//     if (!user) {
//       return next(new ErrorHandler("User not found", 400));
//     }

//     if (newPassword != confirmNewPassword) {
//       return next(
//         new ErrorHandler(
//           "New password is not match with confrimed password",
//           400
//         )
//       );
//     }
//     const isMatch = await user.comparePassword(oldPassword);

//     if (!isMatch) {
//       return next(new ErrorHandler("Invalid old password", 400));
//     }

//     user.password = newPassword;
//     await user.save();

//     res
//       .status(200)
//       .json({ success: true, message: "Password updated successfully" });
//   } catch (error) {
//     console.error(error);
//     next(new ErrorHandler(error.message, 500));
//   }
// };

// // get all user orders
// exports.getAllOrdersOfUser = async (req, res, next) => {
//   try {
//     const userID = req.user.id;

//     const userOrders = await Order.find({ user: userID }).sort({
//       createdAt: -1,
//     });

//     res.status(200).json({ success: true, orders: userOrders });
//   } catch (error) {
//     console.log(error);
//     next(new ErrorHandler(error.message, 500));
//   }
// };
