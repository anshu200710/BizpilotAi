import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createInvoice,
  getInvoices,
  updateInvoice,
  deleteInvoice,
} from "../controllers/invoiceController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/", authMiddleware, createInvoice);
router.get("/", authMiddleware, getInvoices);
router.put("/:id", authMiddleware, updateInvoice);
router.delete("/:id", authMiddleware, deleteInvoice);

// Logo upload
router.post(
  "/upload-logo",
  authMiddleware,
  upload.single("logo"),
  (req, res) => {
    res.json({ url: req.file.path });
  }
);

export default router;
