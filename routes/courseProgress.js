const express = require("express");
const checkAuth = require("../middlewares/checkAuth");
const { getCourseProgress, updateLectureProgress, markAsCompleted, markAsInComplete } = require("../controller/courseProgress");
const router = express.Router()
router.get("/:id", checkAuth, getCourseProgress)
router.post("/:courseId/lecture/:lectureId/view", checkAuth, updateLectureProgress)
router.post("/:courseId/complete", checkAuth, markAsCompleted)
router.post("/:courseId/inComplete", checkAuth, markAsInComplete)
module.exports = router