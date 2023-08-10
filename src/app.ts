import express from "express";
import config from "config";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
// import logger from "morgan";
import ErrorHandler from "./middleware/error";

// Create Express app
const app = express();

const nodeEnv = config.get<string>("nodeEnv");

// if (nodeEnv !== "PRODUCTION") {
//   require("dotenv").config({
//     path: "./config/.env",
//   });
// }

// Define allowed origins based on the environment
const allowedOrigins =
  nodeEnv === "PRODUCTION"
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
// app.use(logger("dev"));
app.use("/", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Import routes
const userRoutes = require("./routes/user.routes");
const shopRoutes = require("./routes/shop.routes");
const productRoutes = require("./routes/product.routes");
const couponRoutes = require("./routes/coupons.routes");
const paymentRoutes = require("./routes/payment.routes");
const orderRoutes = require("./routes/order.routes");
const eventRoutes = require("./routes/event.routes");
const cartRoutes = require("./routes/cart.routes");
const wishlistRoutes = require("./routes/wishlist.routes");

// Routes
app.use("/api/v2/coupons", couponRoutes);
app.use("/api/v2/users", userRoutes);
app.use("/api/v2/shops", shopRoutes);
app.use("/api/v2/products", productRoutes);
app.use("/api/v2/payments", paymentRoutes);
app.use("/api/v2/orders", orderRoutes);
app.use("/api/v2/events", eventRoutes);
app.use("/api/v2/cart", cartRoutes);
app.use("/api/v2/wishlist", wishlistRoutes);

// Catch-all route handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// If error
app.use(ErrorHandler);

module.exports = app;
