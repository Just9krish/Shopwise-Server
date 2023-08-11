import UserToken from "../models/usertoken.model";
import ErrorHandler from "../utils/errorHandler";
import logger from "../utils/logger";

const saveVerificationToken = async (userId: string, hashedToken: string) => {
  try {
    const userToken = await UserToken.create({
      userId: userId,
      vToken: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60 * (60 * 1000),
    });

    return userToken;
  } catch (error) {
    logger.error(error);
    throw new ErrorHandler("Failed to create token", 500);
  }
};

const findVerificationToken = async (vHashedToken: string) => {
  try {
    const userToken = await UserToken.findOne({
      vToken: vHashedToken,
      expiresAt: { $gt: Date.now() },
    });

    return userToken;
  } catch (error) {
    logger.error(error);
    throw new ErrorHandler("Invalid or Expired token", 400);
  }
};

const findOneAndDeleteUserToken = async (userId: string) => {
  try {
    const userToken = await UserToken.findOneAndDelete({ userId: userId });

    return userToken;
  } catch (error: any) {
    logger.error(error);
    throw new ErrorHandler(error.message, 500);
  }
};

export {
  saveVerificationToken,
  findVerificationToken,
  findOneAndDeleteUserToken,
};
