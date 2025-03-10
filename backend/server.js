import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.route.js"
import productRoutes from "./routes/product.route.js"
import debugRoutes from "./routes/debug.route.js"
import cartRoutes from "./routes/cart.route.js"
import couponRoutes from "./routes/coupon.route.js"
import paymentRoutes from "./routes/payment.route.js"

import { connenctDB } from "./lib/db.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // parse body of request
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payment", paymentRoutes)

app.use("/api/debug", debugRoutes);

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connenctDB();
});