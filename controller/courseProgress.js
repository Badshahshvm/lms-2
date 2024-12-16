const bcrypt = require("bcrypt");
const User = require("../models/user");
const Lecture = require("../models/lecture");
const jwt = require("jsonwebtoken");
const Course = require("../models/course");
require("dotenv").config();

const CourseProgress = require("../models/courseProgress");

const getCourseProgress = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verifyUser = jwt.verify(token, "shivam 123");
    let courseprogress = await CourseProgress.findOne({
      userId: verifyUser._id,
      courseId: req.params.id
    }).populate("courseId");

    const courseDetails = await Course.findById(req.params.id).populate("lectures");

    if (!courseDetails) {
      return res.json({
        success: false,
        message: "Course Not Found.."
      });
    }

    if (!courseprogress) {
      return res.json({
        success: false,
        course: courseDetails,
        progress: [],
        completed: false
      });
    }

    res.json({
      success: true,
      message: "Course Progress is here",
      course: courseDetails,
      progress: courseprogress.lectureProgress,
      completed: courseprogress.completed
    });
  } catch (err) {
    res.json({
      success: false,
      message: err.message
    });
  }
};

const updateLectureProgress = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verifyUser = jwt.verify(token, "shivam 123");
    const { courseId, lectureId } = req.params;
    const userId = verifyUser._id;
    let courseProgress = await CourseProgress.findOne({ courseId, userId });

    if (!courseProgress) {
      courseProgress = new CourseProgress({
        userId,
        courseId,
        completed: false,
        lectureProgress: []
      });
    }

    const lectureIndex = courseProgress.lectureProgress.findIndex(
      (lecture) => lecture.lectureId === lectureId
    );

    if (lectureIndex !== -1) {
      courseProgress.lectureProgress[lectureIndex].viewed = true;
    } else {
      courseProgress.lectureProgress.push({
        lectureId,
        viewed: true
      });
    }

    const lectureProgressLength = courseProgress.lectureProgress.filter(
      (lectureProg) => lectureProg.viewed
    ).length;
    const course = await Course.findById(courseId);

    if (course.lectures.length === lectureProgressLength) {
      courseProgress.completed = true;
    }

    await courseProgress.save();
    res.json({
      success: true,
      message: "Lecture Progress Updated Successfully",
      progress: courseProgress
    });
  } catch (err) {
    res.json({
      success: false,
      message: err.message
    });
  }
};

const markAsCompleted = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verifyUser = jwt.verify(token, "shivam 123");
    const userId = verifyUser._id;
    const { courseId } = req.params;
    const courseProgress = await CourseProgress.findOne({ courseId, userId });

    if (!courseProgress) {
      return res.json({
        success: false,
        message: "Course Progress unable to track"
      });
    }

    courseProgress.lectureProgress.forEach(
      (lectureProgress) => (lectureProgress.viewed = true)
    );
    courseProgress.completed = true;
    await courseProgress.save();

    res.json({
      success: true,
      progress: courseProgress
    });
  } catch (err) {
    res.json({
      success: false,
      message: err.message
    });
  }
};

const markAsInComplete = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verifyUser = jwt.verify(token, "shivam 123");
    const userId = verifyUser._id;
    const { courseId } = req.params;
    const courseProgress = await CourseProgress.findOne({ courseId, userId });

    if (!courseProgress) {
      return res.json({
        success: false,
        message: "Course Progress unable to track"
      });
    }

    courseProgress.lectureProgress.forEach(
      (lectureProgress) => (lectureProgress.viewed = false)
    );
    courseProgress.completed = false;
    await courseProgress.save();

    res.json({
      success: true,
      progress: courseProgress
    });

  }
  catch (err) {
    res.json({
      success: false,
      message: err.message
    })
  }
}
module.exports = { getCourseProgress, markAsCompleted, markAsInComplete, updateLectureProgress };
