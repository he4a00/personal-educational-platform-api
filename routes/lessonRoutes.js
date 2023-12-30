import express from "express";
import {
  categorizeByClass,
  categorizeByUnit,
  createLesson,
  deleteLesson,
  getAllLessons,
  getLessonById,
} from "../controllers/lessonControllers.js";
import { protect, verifyTokenAndAdmin } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyTokenAndAdmin, createLesson);
router.get("/", getAllLessons);
router.get("/:lessonId", protect, getLessonById);
router.delete("/:lessonId", verifyTokenAndAdmin, deleteLesson);
router.get("/units/:unit", categorizeByUnit);
router.get("/classes/:classroom", categorizeByClass);

export default router;
