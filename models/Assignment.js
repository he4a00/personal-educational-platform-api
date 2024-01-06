import mongoose from "mongoose";

const answersSchema = new mongoose.Schema({
  ansText: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
});

const Questions = mongoose.model(
  "Questions",
  new mongoose.Schema({
    text: {
      type: String,
      required: true,
    },
    answers: [answersSchema], // Array of possible answers
  })
);

export { Questions };

const assignmentSchema = new mongoose.Schema({
  lesson: {
    type: mongoose.Schema.ObjectId,
    ref: "Lesson",
    unique: true,
  },
  questions: [
    {
      question: { type: mongoose.Schema.Types.ObjectId, ref: "Questions" },
      selectedAnswer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Questions.answers",
      },
    },
  ],
});

const Assignment = mongoose.model("Assignment", assignmentSchema);

export { Assignment };
