import mongoose from "mongoose";
import config from "config";
import logger from "../utils/logger";

// const dbUri = config.get<string>("dbUri");
const dbUri = process.env.DBPATH!;

const connetDatabase = () =>
  mongoose.connect(dbUri).then((data) => {
    logger.info(`mongodb connected with server ${data.connection.host}`);
  });

export default connetDatabase;
