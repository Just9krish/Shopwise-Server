import { Response } from "express";
import { ShopDocument } from "../models/shop.model";

interface Options {
  expires: Date;
  httpOnly: boolean;
}

const sendShopToken = (
  seller: ShopDocument,
  statuscode: number,
  res: Response
) => {
  const token = seller.getJwtToken();

  const options: Options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res
    .status(statuscode)
    .cookie("seller_token", token, options)
    .json({ success: true, seller, token });
};

export default sendShopToken;
