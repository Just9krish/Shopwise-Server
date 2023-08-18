import express, { NextFunction, Request, Response } from "express";
import Event from "../models/event.model";
import ErrorHandler from "../utils/errorHandler";
import logger from "../utils/logger";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error: any) {
    logger.error(error);
    next(new ErrorHandler(error.message, 500));
  }
});

export default router;
