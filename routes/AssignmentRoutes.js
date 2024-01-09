import express from "express";
import { protect, verifyTokenAndAdmin } from "../middleware/verifyToken.js";
import {
  createAssignment,
  getLessonAssignment,
} from "../controllers/AssignmentControllers.js";

const router = express.Router();

router.post("/:lessonId", verifyTokenAndAdmin, createAssignment);
router.get("/:lessonId", protect, getLessonAssignment);

export default router;
