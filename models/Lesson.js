import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  videoURL: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  desc: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  classroom: {
    type: String,
    required: true,
  },
});

const Lesson = mongoose.model("Lesson", lessonSchema);

export default Lesson;