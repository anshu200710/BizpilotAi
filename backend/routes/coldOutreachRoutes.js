import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { sendColdMessage } from "../controllers/coldOutreachController.js";

const router = express.Router();

router.post("/send", authMiddleware, sendColdMessage);

export default router;
