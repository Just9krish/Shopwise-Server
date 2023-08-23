import express, { NextFunction, Request, Response } from "express";
import config from "config";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import logger from "morgan";
import ErrorHandler from "./middleware/error";
import "dotenv/config";

// Create Express app
const app = express();
// const nodeEnv = config.get<string>("nodeEnv");

const nodeEnviroment = process.env.NODE_ENV;

if (nodeEnviroment !== "PRODUCTION") {
  require("dotenv").config({
    path: ".env",
  });
}

// Define allowed origins based on the environment
const allowedOrigins =
  nodeEnviroment === "PRODUCTION"
    ? [process.env.CLIENT_DOMAIN_PRO]
    : [process.env.CLIENT_DOMAIN_DEV];

app.use(express.json());
app.use(cookieParser());
// Allow requests from the specified frontend domain
app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(logger("dev"));
app.use("/", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Import routes
import userRoutes from "./routes/user.routes";
import shopRoutes from "./routes/shop.routes";
import productRoutes from "./routes/product.routes";
import couponRoutes from "./routes/coupons.routes";
import paymentRoutes from "./routes/payment.routes";
import orderRoutes from "./routes/order.routes";
import eventRoutes from "./routes/event.routes";
import cartRoutes from "./routes/cart.routes";
import wishlistRoutes from "./routes/wishlist.routes";

// Routes
app.use("/api/v2/users", userRoutes);
app.use("/api/v2/shops", shopRoutes);
app.use("/api/v2/coupons", couponRoutes);
app.use("/api/v2/products", productRoutes);
app.use("/api/v2/payments", paymentRoutes);
app.use("/api/v2/orders", orderRoutes);
app.use("/api/v2/events", eventRoutes);
app.use("/api/v2/cart", cartRoutes);
app.use("/api/v2/wishlist", wishlistRoutes);

// Catch-all route handler for unmatched routes
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// If error
app.use(ErrorHandler);

export default app;
