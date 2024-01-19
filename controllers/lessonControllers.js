import dotenv from "dotenv";
import Lesson from "../models/Lesson.js";
import cloudinary from "cloudinary";
import multer from "multer";
import fs from "fs";
import { Assignment, Questions } from "../models/Assignment.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Create the 'uploads' folder if it doesn't exist
// const uploadsFolder = "uploads";
// if (!fs.existsSync(uploadsFolder)) {
//   fs.mkdirSync(uploadsFolder);
//   console.log(`'uploads' folder created`);
// } else {
//   console.log(`'uploads' folder already exists`);
// }

// Configure Multer for file uploads
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Define how the uploaded files should be named
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"));
    }
  },
}).single("videoURL");

const createLesson = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      try {
        if (err) {
          return res
            .status(400)
            .json({ message: "Video upload failed", error: err });
        }

        if (!req.file || !req.file.path) {
          return res.status(400).json({ message: "No video uploaded" });
        }

        const uploadedVideo = await cloudinary.v2.uploader.upload(
          req.file.path,
          {
            resource_type: "video",
            folder: "videos",
          }
        );

        const { secure_url: videoURL } = uploadedVideo;

        const { title, isPaid, unit, classroom, desc, price, section, status } =
          req.body;

        const existingLesson = await Lesson.findOne({ videoURL });

        if (existingLesson) {
          return res
            .status(409)
            .json({ message: "This lesson already exists" });
        }

        const newLesson = await Lesson.create({
          title,
          isPaid,
          videoURL,
          unit,
          classroom,
          desc,
          price,
          section,
          status,
        });

        return res.status(201).json(newLesson);
      } catch (error) {
        return res.status(500).json({
          error,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "An internal server error occurred" });
  }
};

// get all lessons

const getAllLessons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    const totalLessons = await Lesson.countDocuments();
    const totalPages = Math.ceil(totalLessons / perPage);

    if (totalPages === 0) {
      return res.status(200).json({
        totalLessons: 0,
        totalPages: 0,
        lessons: [],
        currentPage: page,
      });
    }

    const lessons = await Lesson.find()
      .skip((page - 1) * perPage)
      .limit(perPage);

    return res.status(200).json({
      totalPages: totalPages,
      totalLessons: totalLessons,
      lessons: lessons,
      currentPage: page,
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

// get lesson by id

const getLessonById = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({ message: "No lesson found with that ID" });
    }

    return res.status(201).json(lesson);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

// delete lesson

const deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({ message: "No lesson found with that ID" });
    }

    // Find the assignments associated with the lesson
    const assignments = await Assignment.find({ lesson: lesson._id });

    // Remove references to assignments in Questions and delete associated Answers
    for (const assignment of assignments) {
      for (const questionRef of assignment.questions) {
        const question = await Questions.findById(questionRef.question);

        if (question) {
          await Questions.findByIdAndDelete(question._id); // Delete the question

          // Delete associated answers (assuming they are stored within the same document)
          // Modify this according to your schema if answers are in a separate collection
          if (question.answers && question.answers.length > 0) {
            await question.updateOne({ $unset: { answers: "" } }); // Unset the answers
          }
        }
      }
    }

    // Delete the assignments associated with the lesson
    await Assignment.deleteMany({ lesson: lesson._id });

    // Delete the lesson itself
    const deletedLesson = await Lesson.findByIdAndDelete(lessonId);

    return res.status(201).json(deletedLesson);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

// categorize the lessons by the unit

const categorizeByUnit = async (req, res) => {
  try {
    const { unit } = req.params;

    const lessonsByUnit = await Lesson.find({ unit: { $eq: unit } });

    return res.status(200).json({ unit, lessons: lessonsByUnit });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const categorizeByClass = async (req, res) => {
  try {
    const { classroom } = req.params;

    const lessonsByClass = await Lesson.find({ classroom: { $eq: classroom } });

    return res.status(200).json({ classroom, lessons: lessonsByClass });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// categorize the lessons based on the section and the unit then show the lessons with their section and unit
const categorizeBySection = async (req, res) => {
  try {
    const { section, unit, classroom } = req.params;
    const lessons = await Lesson.find({ section, unit, classroom });

    if (lessons.length === 0) {
      return res.status(404).json("There are no lessons in this section");
    }
    res.status(200).json({ lessons });
  } catch (error) {
    res.status(500).json(error);
  }
};

export {
  createLesson,
  getAllLessons,
  getLessonById,
  deleteLesson,
  categorizeByUnit,
  categorizeByClass,
  categorizeBySection,
};
