const app = require("./app");
import connectDatabase from "./db/database";
import config from "config";
import logger from "./utils/logger";

// handle uncaught exception
process.on("uncaughtException", (err) => {
  console.log("Error: " + err.message);
  console.log("Shutting the server for uncaught exception");
});

if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "./config/.env",
  });
}

// connect db
connectDatabase();

const port = config.get<number>("port");

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