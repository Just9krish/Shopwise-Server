import { Response } from "express";
import { UserDocument } from "../models/user.model";

const sendToken = (user: UserDocument, statusCode: number, res: Response) => {
  const token = user.getJwtToken();

  const options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, user, token });
};

export default sendToken;
