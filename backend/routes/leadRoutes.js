import express from "express";
import {
  createLead,
  getLeads,
  updateLead,
  updateLeadStatus,
  deleteLead
} from "../controllers/leadController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createLead);
router.get("/", authMiddleware, getLeads);
router.put("/:id", authMiddleware, updateLead);
router.delete("/:id", authMiddleware, deleteLead);
router.patch("/:id/status", authMiddleware, updateLeadStatus);

export default router;
