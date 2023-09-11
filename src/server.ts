import app from "./app";
import connectDatabase from "./db/database";
import config from "config";
import logger from "./utils/logger";
import dotenv from "dotenv";

// handle uncaught exception
process.on("uncaughtException", (err) => {
  logger.error("Error: " + err.message);
  logger.info("Shutting the server for uncaught exception");
});

if (process.env.NODE_ENV !== "PRODUCTION") {
  dotenv.config();
}

// connect db
connectDatabase();

// const port = config.get<number>("port");
const port = process.env.PORT || 3000;

// connect server
const server = app.listen(port, () => {
  logger.info(`server is running on port ${port}`);
});

// unhandle promise rejection
process.on("unhandledRejection", (err: any) => {
  logger.error(`Shutting down the server for ${err.message}`);
  logger.error(`Shutting down the server for unhandle promise rejection`);

  server.close(() => {
    process.exit(1);
  });
});
