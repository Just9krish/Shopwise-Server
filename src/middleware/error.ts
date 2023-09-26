import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorHandler";

const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err)
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";

  // Set default status code to 500 if err.statusCode is undefined
  if (err.statusCode === undefined) {
    err.statusCode = 500;
  }

  // wrong mongodb id
  if (err.name === "CastError") {
    const message = `Resource is not found with this id. Invalid ${req.path}`;
    err = new ErrorHandler(message, 400);
  }

  // duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate key ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }

  // wrong jwt
  if (err.name === "JsonWebTokenError") {
    const message = `Your URL is invalid. Please try again later`;
    err = new ErrorHandler(message, 400);
  }

  // expired jwt
  if (err.name === "TokenExpiredError") {
    const message = `Your URL has expired. Please try again later`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({ success: false, message: err.message });
};

export default errorMiddleware;
