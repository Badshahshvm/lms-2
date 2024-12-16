const Course = require("../models/course")
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcrypt")
const User = require("../models/user")
const Lecture = require("../models/lecture")
const jwt = require("jsonwebtoken")
require("dotenv").config();

cloudinary.config({
              cloud_name: process.env.CLOUD_NAME,
              api_key: process.env.API_KEY,
              api_secret: process.env.API_SECRET
});

const addCourse = async (req, res) => {
              try {
                            const token = req.headers.authorization.split(" ")[1];
                            const verifyUser = await jwt.verify(token, 'shivam 123');
                            const user = await User.findById(verifyUser._id)
                            if (user.role != "instructor") {
                                          res.json({
                                                        success: false,
                                                        message: "UnAuthorized Action"
                                          })
                            }
                            const uploadedImage = await cloudinary.uploader.upload(req.files.image.tempFilePath);
                            const course = new Course({
                                          courseTitle: req.body.courseTitle,
                                          subTitle: req.body.subTitle,
                                          description: req.body.description,
                                          category: req.body.category,
                                          courseLevel: req.body.courseLevel,
                                          coursePrice: req.body.coursePrice,
                                          courseThumbnailUrl: uploadedImage.secure_url,
                                          courseThumbnailId: uploadedImage.public_id,
                                          creator: verifyUser._id,

                            })
                            await course.save()
                            res.json({
                                          sucess: true,
                                          message: "Course Created Sucessfully",
                                          course: course
                            })

              }
              catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message
                            })
              }
}

const updateCourse = async (req, res) => {
              try {


                            const token = req.headers.authorization.split(" ")[1];
                            const verifyUser = await jwt.verify(token, "shivam 123");
                            const user = await User.findById(verifyUser._id);


                            if (user.role !== "instructor") {
                                          return res.json({
                                                        success: false,
                                                        message: "Unauthorized Action",
                                          });
                            }


                            const course = await Course.findById(req.params.id);
                            if (!course) {
                                          return res.status(404).json({
                                                        success: false,
                                                        message: "Course not found",
                                          });
                            }


                            if (course.creator.toString() !== verifyUser._id) {
                                          return res.status(403).json({
                                                        success: false,
                                                        message: "You are not authorized to update this course",
                                          });
                            }


                            let courseThumbnailUrl = course.courseThumbnailUrl;
                            let courseThumbnailId = course.courseThumbnailId;

                            if (req.files && req.files.image) {

                                          if (courseThumbnailId) {
                                                        await cloudinary.uploader.destroy(courseThumbnailId);
                                          }


                                          const uploadedImage = await cloudinary.uploader.upload(
                                                        req.files.image.tempFilePath
                                          );
                                          courseThumbnailUrl = uploadedImage.secure_url;
                                          courseThumbnailId = uploadedImage.public_id;
                            }


                            course.courseTitle = req.body.courseTitle || course.courseTitle;
                            course.subTitle = req.body.subTitle || course.subTitle;
                            course.description = req.body.description || course.description;
                            course.category = req.body.category || course.category;
                            course.courseLevel = req.body.courseLevel || course.courseLevel;
                            course.coursePrice = req.body.coursePrice || course.coursePrice;
                            course.courseThumbnailUrl = courseThumbnailUrl;
                            course.courseThumbnailId = courseThumbnailId;


                            await course.save();

                            res.json({
                                          success: true,
                                          message: "Course updated successfully",
                                          course: course,
                                          user: user
                            });
              } catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message,
                            });
              }
};
const getAllCourse = async (req, res) => {
              try {
                            const courses = await Course.find({})
                                          .populate('creator', 'name email photoUrl')
                                          .exec();

                            res.json({
                                          success: true,
                                          message: "All Courses are fetched",
                                          courses: courses
                            });
              } catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message
                            });
              }
}


const getCreatorCourse = async (req, res) => {
              try {
                            const token = req.headers.authorization.split(" ")[1];
                            const verifyUser = await jwt.verify(token, 'shivam 123');
                            const courses = await Course.find({ creator: verifyUser._id })
                            res.json({
                                          success: true,
                                          message: "Your Created Course is here",
                                          courses: courses
                            })


              }
              catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message
                            })
              }
}
const deleteCourse = async (req, res) => {
              try {
                            const token = req.headers.authorization.split(" ")[1];
                            const verifyUser = await jwt.verify(token, "shivam 123");
                            const user = await User.findById(verifyUser._id);

                            if (user.role !== "instructor") {
                                          return res.status(403).json({
                                                        success: false,
                                                        message: "Unauthorized Action",
                                          });
                            }

                            const course = await Course.findById(req.params.id);
                            if (!course) {
                                          return res.status(404).json({
                                                        success: false,
                                                        message: "Course not found",
                                          });
                            }

                            if (course.creator.toString() !== verifyUser._id) {
                                          return res.status(403).json({
                                                        success: false,
                                                        message: "You are not authorized to delete this course",
                                          });
                            }

                            await Course.findByIdAndDelete(req.params.id);

                            res.json({
                                          success: true,
                                          message: "Course deleted successfully",
                            });
              } catch (err) {
                            res.status(500).json({
                                          success: false,
                                          message: err.message,
                            });
              }
};


const addLecture = async (req, res) => {
              try {
                            const uploadedVideo = await cloudinary.uploader.upload(req.files.video.tempFilePath, {
                                          resource_type: 'video'
                            });
                            const token = req.headers.authorization.split(" ")[1];
                            const verifyUser = await jwt.verify(token, "shivam 123");
                            const user = await User.findById(verifyUser._id);

                            if (user.role !== "instructor") {
                                          return res.status(403).json({
                                                        success: false,
                                                        message: "Unauthorized Action",
                                          });
                            }

                            const course = await Course.findById(req.params.id);
                            if (!course) {
                                          return res.status(404).json({
                                                        success: false,
                                                        message: "Course not found",
                                          });
                            }

                            if (course.creator.toString() !== verifyUser._id) {
                                          return res.status(403).json({
                                                        success: false,
                                                        message: "You are not authorized to delete this course",
                                          });
                            }
                            const lecture = new Lecture({
                                          lectureTitle: req.body.lectureTitle,
                                          videoUrl: uploadedVideo.secure_url,
                                          publicId: uploadedVideo.public_id
                            })
                            await lecture.save();
                            if (course) {
                                          course.lectures.push(lecture._id);
                                          await course.save();
                            }

                            res.json({
                                          sucess: true,
                                          message: "Lecture is Added Sucessfully",
                                          lecture: lecture,
                                          course: course
                            })




              }
              catch (err) {
                            res.json({
                                          sucess: false,
                                          message: err.message
                            })
              }
}

const getCourseLectures = async (req, res) => {
              try {

                            const course = await Course.findById(req.params.id).populate("lectures");
                            if (!course) {
                                          return res.status(404).json({
                                                        message: "Course not found"
                                          })
                            }
                            return res.status(200).json({
                                          lectures: course.lectures
                            });


              }
              catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message
                            })
              }
}


const updateLecture = async (req, res) => {
              try {
                            const token = req.headers.authorization.split(" ")[1];
                            const verifyUser = await jwt.verify(token, "shivam 123");
                            const user = await User.findById(verifyUser._id);

                            if (user.role !== "instructor") {
                                          return res.json({
                                                        success: false,
                                                        message: "Unauthorized Action",
                                          });
                            }





                            const lecture = await Lecture.findById(req.params.id);
                            if (!lecture) {
                                          return res.json({
                                                        success: false,
                                                        message: "Lecture not found",
                                          });
                            }

                            let videoUrl = lecture.videoUrl;
                            let publicId = lecture.publicId;

                            if (req.files && req.files.video) {
                                          await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
                                          const uploadedVideo = await cloudinary.uploader.upload(
                                                        req.files.video.tempFilePath,
                                                        { resource_type: "video" }
                                          );
                                          videoUrl = uploadedVideo.secure_url;
                                          publicId = uploadedVideo.public_id;
                            }

                            lecture.lectureTitle = req.body.lectureTitle || lecture.lectureTitle;
                            lecture.videoUrl = videoUrl;
                            lecture.publicId = publicId;

                            await lecture.save();

                            res.json({
                                          success: true,
                                          message: "Lecture updated successfully",
                                          lecture: lecture,
                            });
              } catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message,
                            });
              }
};


const deleteLecture = async (req, res) => {
              try {
                            const token = req.headers.authorization.split(" ")[1];
                            const verifyUser = await jwt.verify(token, "shivam 123");
                            const user = await User.findById(verifyUser._id);

                            if (user.role !== "instructor") {
                                          return res.json({
                                                        success: false,
                                                        message: "Unauthorized Action",
                                          });
                            }

                            const { lectureId, courseId } = req.params;

                            const course = await Course.findById(courseId);
                            if (!course) {
                                          return res.json({
                                                        success: false,
                                                        message: "Course not found",
                                          });
                            }

                            const lectureIndex = course.lectures.findIndex(
                                          (lecture) => lecture._id.toString() === lectureId
                            );

                            if (lectureIndex === -1) {
                                          return res.json({
                                                        success: false,
                                                        message: "Lecture not found in course",
                                          });
                            }

                            course.lectures.splice(lectureIndex, 1);
                            await course.save();
                            await Lecture.findByIdAndDelete(lectureId);

                            res.json({
                                          success: true,
                                          message: "Lecture deleted successfully",
                            });
              } catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message,
                            });
              }
};

const isPublishCourse = async (req, res) => {
              try {
                            const { publish } = req.query;
                            const token = req.headers.authorization.split(" ")[1];
                            const verifyUser = await jwt.verify(token, "shivam 123");
                            const user = await User.findById(verifyUser._id);

                            if (user.role !== "instructor") {
                                          return res.json({
                                                        success: false,
                                                        message: "Unauthorized Action",
                                          });
                            }

                            const course = await Course.findById(req.params.id);

                            if (!course) {
                                          return res.json({
                                                        success: false,
                                                        message: "Course not found",
                                          });
                            }

                            course.isPublished = publish === "true";
                            await course.save();

                            const status = course.isPublished ? "Published" : "Unpublished";
                            res.json({
                                          success: true,
                                          message: `Course is ${status}`,
                            });
              } catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message,
                            });
              }
};

const getCourseById = async (req, res) => {
              try {
                            const course = await Course.findById(req.params.id)
                                          .populate('creator', 'name email photoUrl')
                                          .populate('lectures')
                                          .exec();


                            if (!course) {
                                          return res.json({
                                                        success: false,
                                                        message: "Course not found",
                                          });
                            }

                            res.json({
                                          sucess: true,
                                          message: "Course is fetched from database",
                                          course: course
                            })

              }
              catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message
                            })
              }
}
const getSearchCourse = async (req, res) => {
              try {
                            const { query = "", categories = [], price = "" } = req.query;

                            // Ensure `categories` is always an array
                            const categoryFilter = Array.isArray(categories) ? categories : [categories];

                            // Create search criteria
                            const searchCriteria = {
                                          isPublished: true,
                                          $or: [
                                                        { courseTitle: { $regex: query, $options: "i" } },
                                                        { subTitle: { $regex: query, $options: "i" } },
                                                        { category: { $regex: query, $options: "i" } },
                                          ],
                            };

                            // Add category filter if categories are provided
                            if (categories.length > 0) {
                                          searchCriteria.category = { $in: categoryFilter };
                            }

                            // Define sorting options for price
                            const sortOptions = {};
                            if (price === "low") {
                                          sortOptions.coursePrice = 1; // Ascending order
                            } else if (price === "high") {
                                          sortOptions.coursePrice = -1; // Descending order
                            }

                            // Fetch courses based on search criteria and sort options
                            const courses = await Course.find(searchCriteria)
                                          .populate({ path: "creator", select: "name email" })
                                          .sort(sortOptions);

                            // Send the fetched courses as a response
                            res.json({
                                          success: true,
                                          courses: courses.length > 0 ? courses : [],
                                          message: courses.length === 0 ? "No courses found for the given criteria." : undefined,
                            });
              } catch (err) {
                            // Handle errors
                            res.status(500).json({
                                          success: false,
                                          message: "An error occurred while fetching courses.",
                                          error: err.message,
                            });
              }
};

const serachCourse = async (req, res) => {
              try {
                            const { query = "", categories = [], price = "" } = req.query;


                            const categoryFilter = Array.isArray(categories) ? categories : [categories];


                            const searchCriteria = {
                                          isPublished: true,
                                          $or: [
                                                        { courseTitle: { $regex: query, $options: "i" } },
                                                        { subTitle: { $regex: query, $options: "i" } },
                                                        { category: { $regex: query, $options: "i" } },
                                          ],
                            };


                            if (categories.length > 0) {
                                          searchCriteria.category = { $in: categoryFilter };
                            }

                            // Define sorting options for price
                            const sortOptions = {};
                            if (price === "low") {
                                          sortOptions.coursePrice = 1; // Ascending order
                            } else if (price === "high") {
                                          sortOptions.coursePrice = -1; // Descending order
                            }

                            // Fetch courses based on search criteria and sort options
                            const courses = await Course.find(searchCriteria)
                                          .populate({ path: "creator", select: "name email" })
                                          .sort(sortOptions);

                            // Send the fetched courses as a response
                            res.json({
                                          success: true,
                                          courses: courses.length > 0 ? courses : [],
                                          message: courses.length === 0 ? "No courses found for the given criteria." : undefined,
                            });
              } catch (err) {
                            // Handle errors
                            res.status(500).json({
                                          success: false,
                                          message: "An error occurred while fetching courses.",
                                          error: err.message,
                            });
              }

}
module.exports = { addCourse, getAllCourse, getCreatorCourse, updateCourse, deleteCourse, addLecture, getCourseLectures, updateLecture, deleteLecture, isPublishCourse, getCourseById, getSearchCourse, serachCourse }