import { Assignment, Questions } from "../models/Assignment.js"; // Assuming correct import path
import Lesson from "../models/Lesson.js";

const createAssignment = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { text, answers } = req.body; // Assuming answers is an array of objects { ansText, isCorrect }

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const createdQuestions = await Promise.all(
      // Create questions along with their associated answers
      text.map(async (questionText, index) => {
        const newQuestion = await Questions.create({
          text: questionText,
          answers: answers[index],
        });
        return newQuestion;
      })
    );

    const newAssignment = await Assignment.create({
      lesson: lesson._id,
      questions: createdQuestions.map((question) => ({
        question: question._id,
        selectedAnswer: question.answers.find((answer) => answer.isCorrect)?.id, // Set the selected answer (assuming there's only one correct answer)
      })),
    });

    lesson.assignment = newAssignment._id;
    await lesson.save();

    return res.status(201).json(newAssignment);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getLessonAssignment = async (req, res) => {
  const { lessonId } = req.params;

  try {
    const assignments = await Assignment.find({ lesson: lessonId })
      .populate({
        path: "questions.question",
        model: "Questions",
        populate: {
          path: "answers",
          model: "Answers",
        },
      })
      .exec();

    if (!assignments) {
      return res.status(404).json({ message: "Assignments not found" });
    }

    res.status(200).json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { createAssignment, getLessonAssignment };
