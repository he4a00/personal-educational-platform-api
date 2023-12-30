import express from "express";
import { protect, verifyTokenAndAdmin } from "../middleware/verifyToken.js";
import {
  adminUnlockLessonForUser,
  getTheUserUnlockedLessons,
  makeAvailableToAllUsers,
} from "../controllers/OwnedLessonsControllers.js";

const router = express.Router();

router.post("/", verifyTokenAndAdmin, adminUnlockLessonForUser);
router.get("/:userId", protect, getTheUserUnlockedLessons);
router.post("/all/", protect, makeAvailableToAllUsers);

export default router;
