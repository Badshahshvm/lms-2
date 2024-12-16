const User = require("../models/user")
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config();

cloudinary.config({
              cloud_name: process.env.CLOUD_NAME,
              api_key: process.env.API_KEY,
              api_secret: process.env.API_SECRET
});


const register = async (req, res) => {
              try {

                            const existingUser = await User.findOne({ email: req.body.email });

                            if (existingUser) {
                                          return res.json({
                                                        success: false,
                                                        message: "User already registered"
                                          });
                            }


                            const uploadedImage = await cloudinary.uploader.upload(req.files.image.tempFilePath);

                            // Hash the user's password
                            const hashPassword = await bcrypt.hash(req.body.password, 10);


                            const user = new User({
                                          name: req.body.name,
                                          email: req.body.email,
                                          password: hashPassword,
                                          photoUrl: uploadedImage.secure_url,
                                          photoId: uploadedImage.public_id,
                                          role: req.body.role
                            });


                            await user.save();


                            res.json({
                                          success: true,
                                          message: "Signup successfully",
                                          user: user
                            });


              }
              catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message
                            })
              }
}

const login = async (req, res) => {
              try {
                            console.log(req.body);
                            const users = await User.find({ email: req.body.email });

                            if (users.length === 0) {
                                          return res.json({
                                                        success: false,
                                                        message: "User not found"
                                          });
                            }

                            const isPassword = await bcrypt.compare(req.body.password, users[0].password);

                            if (!isPassword) {
                                          return res.json({
                                                        success: false,
                                                        message: "Invalid password"
                                          });
                            }

                            const token = jwt.sign({
                                          _id: users[0]._id,
                                          name: users[0].name,

                                          email: users[0].email,

                                          photoId: users[0].photoId,
                                          photoUrl: users[0].photoUrl
                            }, 'shivam 123', { expiresIn: '365d' });

                            res.json({
                                          success: true,
                                          message: "Successfully logged in",
                                          user: users[0],
                                          token: token
                            });

              }
              catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message
                            })
              }
}


const logout = async (req, res) => {
              try {
                            const { token } = req.body;
                            const user = await User.findOne({ token: token });
                            if (!user) {
                                          res.json({
                                                        success: false,
                                                        message: "User not found"
                                          })
                            }
                            user.token = null; // Remove the token from the user record
                            await user.save();

                            res.json({
                                          success: true,
                                          message: "User logged out successfully"
                            });

              }
              catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message
                            })
              }
}

// const getProfile = async (req, res) => {
//               try {

//                             const token = req.headers.authorization.split(" ")[1];
//                             const verifyUser = await jwt.verify(token, 'shivam 123');
//                             const existUser = await User.findById(verifyUser._id).populate("enrolledCourses");
//                             if (!existUser) {
//                                           res.json({
//                                                         success: false,
//                                                         message: "UnAuthorized Action"
//                                           })
//                             }

//                             res.json({
//                                           success: true,
//                                           message: "User Found",
//                                           user: existUser
//                             })

//               }
//               catch (err) {
//                             res.json({
//                                           success: false,
//                                           message: err.message
//                             })
//               }
// }

const getProfile = async (req, res) => {
              try {
                            const token = req.headers.authorization.split(" ")[1];
                            const verifyUser = await jwt.verify(token, 'shivam 123'); // Verify the token

                            const existUser = await User.findById(verifyUser._id)
                                          .populate({
                                                        path: "enrolledCourses", // Populate enrolled courses
                                                        populate: {
                                                                      path: "creator", // Nested populate for the creator of each course
                                                                      select: "name email photoUrl", // Select only specific fields for the creator
                                                        },
                                          });

                            if (!existUser) {
                                          return res.json({
                                                        success: false,
                                                        message: "Unauthorized Action",
                                          });
                            }

                            res.json({
                                          success: true,
                                          message: "User Found",
                                          user: existUser,
                            });
              } catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message,
                            });
              }
};

const updateUser = async (req, res) => {
              try {
                            const token = req.headers.authorization.split(" ")[1];
                            const verifyUser = await jwt.verify(token, 'shivam 123');

                            const { name } = req.body;

                            let updatedData = { name };

                            if (req.files && req.files.image) {
                                          const uploadedImage = await cloudinary.uploader.upload(req.files.image.tempFilePath);


                                          updatedData.photoUrl = uploadedImage.secure_url;
                                          updatedData.photoId = uploadedImage.public_id;
                            }


                            const updatedUser = await User.findByIdAndUpdate(
                                          verifyUser._id,
                                          { $set: updatedData },
                                          { new: true } // `new: true` ensures the updated user document is returned.
                            );

                            res.json({
                                          success: true,
                                          message: "Profile updated successfully",
                                          user: updatedUser,
                            });
              } catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message,
                            });
              }
};

module.exports = { register, login, logout, getProfile, updateUser }