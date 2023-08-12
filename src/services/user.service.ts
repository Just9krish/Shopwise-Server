import User, { UserInput } from "../models/user.model";
import fs from "fs";
import Token from "../models/usertoken.model";
import { hashToken, creatVerificationToken } from "../utils/hashToken";
import sendMail from "./mail.service";
import ErrorHandler from "../utils/errorHandler";
import logger from "../utils/logger";
import {
  findOneAndDeleteUserToken,
  findVerificationToken,
  saveVerificationToken,
} from "./userToken.service";
import path from "path";

const CLIENT_DOMAIN =
  process.env.NODE_ENV === "PRODUCTION"
    ? process.env.CLIENT_DOMAIN_PROD
    : process.env.CLIENT_DOMAIN_DEV;

interface UpdateUserProfileInput {
  userId: string;
  email: string;
  password: string;
  primaryPhoneNumber: number;
  secondaryPhoneNumber: number;
  name: string;
}

export async function createUserAndSendVerificationEmail(input: UserInput) {
  try {
    const { name, email, password } = input;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return new ErrorHandler("User already exists", 400);
    }

    const user = await User.create({
      email: email,
      password: password,
      name: name,
    });

    // Delete Token if it exists in DB
    const token = await findOneAndDeleteUserToken(user._id);

    const verificationToken = creatVerificationToken(user._id);

    const hashedToken = hashToken(verificationToken);

    await saveVerificationToken(user._id, hashedToken);

    const verificationUrl = `${CLIENT_DOMAIN}/user/verify/${verificationToken}`;

    const subject = "Verify Your Account - Shopwise";
    const sent_from = process.env.SMPT_MAIL!;
    const reply_to = "noreply@shopwise.com";
    const template = "verifyEmail";
    const link = verificationUrl;
    const logoUrl = process.env.SHOP_LOGO!;

    await sendMail(
      subject,
      email,
      sent_from,
      reply_to,
      template,
      name,
      link,
      logoUrl
    );

    return {
      success: true,
      message: "Verification Email Sent",
    };
  } catch (error) {
    logger.error(error);
    throw new ErrorHandler("Failed to create user", 500);
  }
}

export async function verifyUserEmail(token: string) {
  try {
    const hashedToken = hashToken(token);

    const userToken = await findVerificationToken(hashedToken);

    if (!userToken) {
      throw new ErrorHandler("Invalid or Expired Token", 404);
    }

    const user = await User.findById(userToken.userId);

    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    if (user.isEmailVerified) {
      throw new ErrorHandler("User is already verified", 400);
    }

    user.isEmailVerified = true;

    return await user.save();
  } catch (error) {
    logger.error(error);
    throw new ErrorHandler("Failed to verify user email", 500);
  }
}

export async function loginUserAndSetCookie(input: {
  email: string;
  password: string;
}) {
  try {
    const { email, password } = input;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new ErrorHandler("Invalid Credentials", 404);
    }

    if (!user.isEmailVerified) {
      throw new ErrorHandler("Email is not verified", 400);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new ErrorHandler("Invalid Credentials", 400);
    }

    return user;
  } catch (error: any) {
    logger.error(error);
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
}

export async function getUserDetailsById(userId: string) {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    return user;
  } catch (error) {
    logger.error(error);
    throw new ErrorHandler("Failed to get user details", 500);
  }
}

export async function forgotPasswordByUserEmail(email: string) {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new ErrorHandler("Invalid email", 400);
    }

    const token = await findOneAndDeleteUserToken(user._id);

    // Create a new token
    const resetToken = creatVerificationToken(user._id);

    // Hash token
    const hashedToken = hashToken(resetToken);

    // Saving token
    await saveVerificationToken(user._id, hashedToken);

    const resetUrl = `${CLIENT_DOMAIN}/resetPassword/${resetToken}`;

    // Send Email
    const subject = "Password Reset Request - Shopwise";
    const send_to = user.email;
    const sent_from = process.env.SMPT_MAIL!;
    const reply_to = "noreply@shopwise.com";
    const template = "forgotPassword";
    const name = user.name;
    const link = resetUrl;
    const logoUrl = process.env.SHOP_LOGO!;

    await sendMail(
      subject,
      send_to,
      sent_from,
      reply_to,
      template,
      name,
      link,
      logoUrl
    );
  } catch (error) {
    throw new ErrorHandler("Something went wrong", 500);
  }
}

export async function resetUserPassword(token: string, newPassword: string) {
  try {
    const hashedToken = hashToken(token);

    const userToken = await findVerificationToken(hashedToken);

    if (!userToken) {
      throw new ErrorHandler("Invalid or Expired Token", 404);
    }

    const user = await User.findById(userToken.userId);

    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    user.password = newPassword;

    return await user.save();
  } catch (error) {
    logger.error(error);
    throw new ErrorHandler("Failed to reset password", 500);
  }
}

export const updateUserProfile = async ({
  userId,
  email,
  password,
  primaryPhoneNumber,
  secondaryPhoneNumber,
  name,
}: UpdateUserProfileInput) => {
  try {
    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new ErrorHandler("Enter Correct Password", 400);
    }

    user.name = name;
    user.email = email;
    user.primaryPhoneNumber = primaryPhoneNumber;
    user.secondaryPhoneNumber = secondaryPhoneNumber;

    await user.save();

    return user;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const updateUserProfileImage = async (
  userId: string,
  file: Express.Multer.File
) => {
  try {
    const existingUser = await User.findById(userId);

    if (!existingUser) {
      throw new ErrorHandler("User not found", 404);
    }

    const existingPath = path.resolve(`uploads/${existingUser.avatar}`);

    // Remove the existing profile picture
    fs.unlinkSync(existingPath);

    const user = await User.findByIdAndUpdate(userId, {
      avatar: file.filename,
    });

    return user;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const addUserAddress = async (
  userId: string,
  country: string,
  state: string,
  address1: string,
  address2: string,
  address3: string,
  zipcode: number,
  addressType: string
) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    const sameTypeAddress = user.addresses.find(
      (address) => address.addressType === addressType
    );

    if (sameTypeAddress) {
      throw new ErrorHandler(`${addressType} already exists`, 400);
    }

    user.addresses.push({
      country,
      state,
      address1,
      address2,
      address3,
      zipcode,
      addressType,
    });

    return await user.save();
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const deleteUserAddress = async (userId: string, addressId: string) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const addressIndex = user.addresses.findIndex(
      (address) => address._id.toString() === addressId
    );

    if (addressIndex === -1) {
      throw new ErrorHandler("Address not found", 404);
    }

    user.addresses.splice(addressIndex, 1);

    return await user.save();
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const changeUserPassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
  confirmNewPassword: string
): Promise<void> => {
  try {
    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      throw new ErrorHandler("Invalid old password", 400);
    }

    user.password = newPassword;
    await user.save();
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};
