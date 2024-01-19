import express from "express";
import { protect, verifyTokenAndAdmin } from "../middleware/verifyToken.js";
import {
  createFeedback,
  getAllFeedbacks,
  updateFeedbackRead,
} from "../controllers/feedbackControllers.js";

const router = express.Router();

router.post("/", protect, createFeedback);
router.get("/", verifyTokenAndAdmin, getAllFeedbacks);
router.patch("/:feedbackId", verifyTokenAndAdmin, updateFeedbackRead);

export default router;
