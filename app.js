import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

// import routes

import userRoutes from "./routes/userRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import OwnedRoutes from "./routes/OwnedLessonsRoutes.js";

connectDB();

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.listen(process.env.PORT, () => {
  console.log("listening on port", process.env.PORT);
});

// routes

app.use("/api/users", userRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/owned", OwnedRoutes);
