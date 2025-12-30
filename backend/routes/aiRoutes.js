import express from "express";
import { aiReply } from "../controllers/aiController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { aiRateLimiter } from "../middleware//rateLimitMiddleware.js";

const router = express.Router();

/**
 * POST /api/ai/reply
 */
router.post("/reply", authMiddleware, aiRateLimiter, aiReply);

export default router;
