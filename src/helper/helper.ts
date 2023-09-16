import { Buffer } from "buffer";
import ErrorHandler from "../utils/errorHandler"; // Make sure to import your ErrorHandler

export function createActivationToken(
  user: object,
  expirationDate: Date
): string {
  const randomString =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  const encodedString = Buffer.from(
    `${randomString}|${JSON.stringify(user)}|${expirationDate.getTime()}`
  ).toString("base64");
  return encodedString;
}

export function decodeActivationToken(encodedString: string): object {
  const decodedString = Buffer.from(encodedString, "base64").toString("utf8");
  const [randomString, encodedUser, expirationTime] = decodedString.split("|");
  const decodedUser = JSON.parse(encodedUser);

  if (parseInt(expirationTime, 10) < Date.now()) {
    throw new ErrorHandler("Expiration time has passed", 400);
  }
  return decodedUser;
}

export const getCartItemPrice = (item: any) => {
  return item.discountPercentage > 0 ? item.discountPrice : item.price;
};
