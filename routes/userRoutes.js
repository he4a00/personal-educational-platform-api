import express from "express";

const router = express.Router();
import { protect, verifyTokenAndAdmin } from "../middleware/verifyToken.js";

import {
  getAllUsers,
  login,
  logout,
  register,
} from "../controllers/userControllers.js";

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/", verifyTokenAndAdmin, getAllUsers);

export default router;
