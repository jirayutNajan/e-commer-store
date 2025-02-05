import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.route.js"
import debugRoutes from "./routes/debug.route.js"

import { connenctDB } from "./lib/db.js";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // parse body of request
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/debug", debugRoutes);

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connenctDB();
});