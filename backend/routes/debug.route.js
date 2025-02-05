import express from "express";
import { getAllUserDebug } from "../controllers/debug.controller.js";

const router = express.Router();

router.get("/users", getAllUserDebug);

export default router;