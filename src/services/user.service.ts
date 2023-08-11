import User, { UserInput } from "../models/user.model";
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

const CLIENT_DOMAIN =
  process.env.NODE_ENV === "PRODUCTION"
    ? process.env.CLIENT_DOMAIN_PROD
    : process.env.CLIENT_DOMAIN_DEV;

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
  } catch (error) {
    logger.error(error);
    throw new ErrorHandler("Failed to login user", 500);
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
