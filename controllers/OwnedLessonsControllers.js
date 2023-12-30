import LessonOwnership from "../models/OwnedLessons.js";
import User from "../models/User.js";

const adminUnlockLessonForUser = async (req, res) => {
  try {
    const { userId, lessonId } = req.body;

    const existingOwnership = await LessonOwnership.findOne({
      userId,
      lessonId,
    });

    if (existingOwnership) {
      return res.status(409).json({
        success: false,
        message: "Lesson is already unlocked for the user",
      });
    }

    const lessonOwnership = await LessonOwnership.create({
      userId,
      lessonId,
    });

    return res.status(201).json({
      success: true,
      message: "Lesson unlocked successfully for the user",
      lessonOwnership,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to unlock lesson for the user",
      error: error.message,
    });
  }
};

const getTheUserUnlockedLessons = async (req, res) => {
  try {
    const { userId } = req.params;

    const unlockedLessons = await LessonOwnership.find({ userId })
      .populate("lessonId")
      .populate("userId");

    if (!unlockedLessons) {
      return res.status(404).json("no unlocked lessons for this user");
    }

    return res.status(201).json(unlockedLessons);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

// controller to unlock specific lesson for all users at once
// Import necessary modules and models

const makeAvailableToAllUsers = async (req, res) => {
  try {
    const { lessonId } = req.body;

    // Find all users who do not already have ownership of this lesson
    const usersWithoutOwnership = await User.find({
      _id: { $nin: await LessonOwnership.distinct("userId", { lessonId }) },
    });

    if (usersWithoutOwnership.length === 0) {
      return res.status(409).json({
        success: false,
        message: "Lesson is already unlocked for all users",
      });
    }

    // Create lesson ownership records for users without ownership
    const ownershipPromises = usersWithoutOwnership.map((user) =>
      LessonOwnership.create({ userId: user._id, lessonId })
    );

    await Promise.all(ownershipPromises);

    return res.status(201).json({
      success: true,
      message: "Lesson unlocked successfully for all users",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to unlock lesson for all users",
      error: error.message,
    });
  }
};

export {
  adminUnlockLessonForUser,
  getTheUserUnlockedLessons,
  makeAvailableToAllUsers,
};
