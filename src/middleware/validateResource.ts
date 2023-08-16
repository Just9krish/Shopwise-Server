import { AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
        file: req.file,
        files: req.files,
      });
      next();
    } catch (error: any) {
      return res.status(400).send(error.errors);
    }
  };

export default validate;
