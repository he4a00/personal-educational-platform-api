import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  desc: {
    type: String,
    required: true,
  },

  isRead: {
    type: Boolean,
    default: false,
  },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
