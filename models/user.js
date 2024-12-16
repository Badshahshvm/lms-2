const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
              name: {
                            type: String,
                            required: true
              },
              email: {
                            type: String,
                            required: true,
                            unique: true
              },
              password: {
                            type: String,
                            required: true
              },
              role: {
                            type: String,
                            enum: ["instructor", "student"],
                            default: 'student'
              },
              enrolledCourses: [
                            {
                                          type: mongoose.Schema.Types.ObjectId,
                                          ref: 'Course'
                            }
              ],
              photoUrl: {
                            type: String,
                            default: ""
              },
              photoId:
              {
                            type: String,
                            default: ""
              }
},
              {
                            timestamps: true
              })

const userModel = mongoose.model("Student", userSchema);
module.exports = userModel;