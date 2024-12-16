const express = require("express");
const checkAuth = require("../middlewares/checkAuth");
const { addCourse, getAllCourse, getCreatorCourse, updateCourse, deleteCourse, addLecture, getCourseLectures, updateLecture, deleteLecture, isPublishCourse, getCourseById, getSearchCourse, serachCourse } = require("../controller/course");
const router = express.Router()
router.get("/",  serachCourse)
router.post("/new", checkAuth, addCourse)
router.get("/all", getAllCourse)
router.get("/admin", checkAuth, getCreatorCourse)
router.put("/update/:id", checkAuth, updateCourse)
router.delete("/:id", checkAuth, deleteCourse)
router.post("/add/lecture/:id", checkAuth, addLecture)
router.get("/lecture/:id", checkAuth, getCourseLectures)
router.put("/update/lecture/:id", checkAuth, updateLecture)
router.delete("/delete/:courseId/:lectureId", checkAuth, deleteLecture)
router.put("/publish/:id", checkAuth, isPublishCourse)
router.get("/:id", checkAuth, getCourseById)
router.get("/search", checkAuth, getSearchCourse)

module.exports = router;
