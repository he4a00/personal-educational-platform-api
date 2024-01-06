import express from "express";
import { protect, verifyTokenAndAdmin } from "../middleware/verifyToken.js";
import { createAssignment } from "../controllers/AssignmentControllers.js";

const router = express.Router();

router.post("/:lessonId", verifyTokenAndAdmin, createAssignment);

export default router;
