import express from "express";
import { getAllProductsDebug, getAllUserDebug } from "../controllers/debug.controller.js";

const router = express.Router();

router.get("/users", getAllUserDebug);

router.get("/products", getAllProductsDebug);

export default router;