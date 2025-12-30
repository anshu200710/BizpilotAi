import express from "express";
import {
  verifyWebhook,
  receiveMessage,
} from "../controllers/whatsappController.js";

const router = express.Router();

// Meta webhook verification
router.get("/webhook", verifyWebhook);

// Incoming WhatsApp messages
router.post("/webhook", receiveMessage);

export default router;
