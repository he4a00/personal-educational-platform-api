import dotenv from "dotenv";
import Lesson from "../models/Lesson.js";
import cloudinary from "cloudinary";
import multer from "multer";
import fs from "fs";


dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Create the 'uploads' folder if it doesn't exist
const uploadsFolder = "uploads";
if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder);
  console.log(`'uploads' folder created`);
} else {
  console.log(`'uploads' folder already exists`);
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Define the destination folder for uploaded files
  },
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

        const { title, isPaid, unit, classroom, desc, price  } = req.body;

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
          price
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

    const deletedLesson = await Lesson.findByIdAndDelete(lessonId);

    return res.status(201).json(`Deleted ${deletedLesson}`);
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

export {
  createLesson,
  getAllLessons,
  getLessonById,
  deleteLesson,
  categorizeByUnit,
  categorizeByClass,
};
