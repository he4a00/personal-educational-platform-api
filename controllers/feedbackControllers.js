import Feedback from "../models/Feedback.js";

const createFeedback = async (req, res) => {
  try {
    const { title, desc } = req.body;

    const feedback = await Feedback.create({
      title,
      desc,
    });

    return res.status(201).json(feedback);
  } catch (error) {
    return res.status(500).json("Internal Server Error");
  }
};

const getAllFeedbacks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    const totalFeedbacks = await Feedback.countDocuments();
    const totalPages = Math.ceil(totalFeedbacks / perPage);

    if (totalPages === 0) {
      return res.status(200).json({
        totalFeedbacks: 0,
        totalPages: 0,
        feedbacks: [],
        currentPage: page,
      });
    }

    const feedbacks = await Feedback.find()
      .skip((page - 1) * perPage)
      .limit(perPage);

    return res.status(201).json({
      totalFeedbacks: totalFeedbacks,
      feedbacks: feedbacks,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const updateFeedbackRead = async (req, res) => {
  try {
    const { feedbackId } = req.body;

    const markIsRead = await Feedback.findOneAndUpdate(
      { feedbackId },
      { isRead: true },
      { new: true }
    );
    return res.status(201).json(markIsRead);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export { createFeedback, getAllFeedbacks, updateFeedbackRead };
