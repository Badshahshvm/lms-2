const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
              courseTitle: {
                            type: String,
                            required: true
              },
              subTitle: { type: String },
              description: { type: String },
              category: {
                            type: String,
                            required: true
              },
              courseLevel: {
                            type: String,
                            enum: ["Beginner", "Medium", "Advance"]
              },
              coursePrice: {
                            type: Number
              },
              courseThumbnailUrl: {
                            type: String,
                            default: ""
              },
              courseThumbnailId: {
                            type: String,
                            default: ""
              },
              enrolledStudents: [
                            {
                                          type: mongoose.Schema.Types.ObjectId,
                                          ref: 'Student'
                            }
              ],
              lectures: [
                            {
                                          type: mongoose.Schema.Types.ObjectId,
                                          ref: "Lecture"
                            }
              ],
              creator: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'Student'
              },
              isPublished: {
                            type: Boolean,
                            default: false
              }

}, { timestamps: true });

const courseModel = mongoose.model("Course", courseSchema);

module.exports = courseModel;