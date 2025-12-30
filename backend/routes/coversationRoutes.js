import express from "express";
import { getConversation } from "../controllers/conversationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:leadId", authMiddleware, getConversation);

export default router;
