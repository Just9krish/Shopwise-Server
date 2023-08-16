import ShopToken from "../models/shoptoken.model";
import ErrorHandler from "../utils/errorHandler";
import logger from "../utils/logger";

const saveVerificationToken = async (shopId: string, hashedToken: string) => {
  try {
    const shopToken = await ShopToken.create({
      shopId: shopId,
      vToken: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60 * (60 * 1000),
    });

    return shopToken;
  } catch (error: any) {
    logger.error(error);
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

const saveResetToken = async (shopId: string, hashedToken: string) => {
  try {
    const shopToken = await ShopToken.create({
      shopId: shopId,
      rToken: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60 * (60 * 1000),
    });

    return shopToken;
  } catch (error: any) {
    logger.error(error);
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

const findVerificationToken = async (vHashedToken: string) => {
  try {
    const shopToken = await ShopToken.findOne({
      vToken: vHashedToken,
      expiresAt: { $gt: Date.now() },
    });

    return shopToken;
  } catch (error: any) {
    logger.error(error);
    throw new ErrorHandler("Invalid or Expired token", 400);
  }
};

const findResetToken = async (vHashedToken: string) => {
  try {
    const shopToken = await ShopToken.findOne({
      rToken: vHashedToken,
      expiresAt: { $gt: Date.now() },
    });

    return shopToken;
  } catch (error: any) {
    logger.error(error);
    throw new ErrorHandler("Invalid or Expired token", 400);
  }
};

const findOneAndDeleteShopToken = async (shopId: string) => {
  try {
    const shopToken = await ShopToken.findOneAndDelete({ shopId: shopId });

    return shopToken;
  } catch (error: any) {
    logger.error(error);
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export {
  saveVerificationToken,
  findVerificationToken,
  findOneAndDeleteShopToken,
  findResetToken,
  saveResetToken,
};
