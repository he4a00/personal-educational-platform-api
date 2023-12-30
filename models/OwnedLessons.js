import mongoose from "mongoose";

const lessonOwnershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson",
    required: true,
  },
});

const LessonOwnership = mongoose.model(
  "LessonOwnership",
  lessonOwnershipSchema
);

export default LessonOwnership;
