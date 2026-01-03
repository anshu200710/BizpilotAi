import express from "express";
import { aiReply } from "../controllers/aiController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { aiRateLimiter } from "../middleware//rateLimitMiddleware.js";
import protect from "../middleware/authMiddleware.js";
import { generateBusinessProfile } from "../controllers/aiController.js";

const router = express.Router();

/**
 * POST /api/ai/reply
 */
router.post("/reply", authMiddleware, aiRateLimiter, aiReply);
router.post("/generate-business-profile", authMiddleware, generateBusinessProfile);


export default router;
