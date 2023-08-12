import multer from "multer";
import { Request } from "express";
import path from "path";
import ErrorHandler from "./utils/errorHandler";

const imageFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new ErrorHandler("Only images are allowed.", 400));
  }
};

const storage = multer.diskStorage({
  destination: function (req: Request, file, cb) {
    cb(null, path.resolve("uploads/"));
  },
  filename: function (req: Request, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = file.originalname.split(".")[0];
    cb(null, filename + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: imageFilter,
});

export default upload;
