// const Course = require("../models/course");
// const cloudinary = require("cloudinary").v2;
// const bcrypt = require("bcrypt");
// const User = require("../models/user");
// const Lecture = require("../models/lecture");
// const jwt = require("jsonwebtoken");
// require("dotenv").config();
// const CoursePurchase = require("../models/coursePurchase");
// const Stripe = require("stripe");

// const stripe = new Stripe(process.env.SECRET_KEY);

// const createCheckOutSession = async (req, res) => {
//               try {
//                             const token = req.headers.authorization.split(" ")[1];
//                             const verifyUser = jwt.verify(token, "shivam 123");

//                             const { courseId } = req.body;

//                             const course = await Course.findById(courseId);
//                             if (!course) {
//                                           return res.status(404).json({
//                                                         success: false,
//                                                         message: "Course Not Found",
//                                           });
//                             }

//                             const purchase = new CoursePurchase({
//                                           courseId: course._id,
//                                           userId: verifyUser._id,
//                                           amount: course.coursePrice,
//                                           status: "pending",
//                             });

//                             const session = await stripe.checkout.sessions.create({
//                                           payment_method_types: ["card"],
//                                           line_items: [
//                                                         {
//                                                                       price_data: {
//                                                                                     currency: "inr",
//                                                                                     product_data: {
//                                                                                                   name: course.courseTitle,
//                                                                                                   images: [course.courseThumbnailUrl],
//                                                                                     },
//                                                                                     unit_amount: course.coursePrice * 100,
//                                                                       },
//                                                                       quantity: 1,
//                                                         },
//                                           ],
//                                           mode: "payment",
//                                           success_url: `http://localhost:5173/course-progress/${courseId}`,
//                                           cancel_url: `http://localhost:5173/course-details/${courseId}`,
//                                           metadata: {
//                                                         courseId: courseId,
//                                                         userId: verifyUser._id,
//                                           },
//                                           shipping_address_collection: {
//                                                         allowed_countries: ["IN"],
//                                           },
//                             });

//                             if (!session.url) {
//                                           return res.status(400).json({
//                                                         success: false,
//                                                         message: "Error while creating session",
//                                           });
//                             }

//                             purchase.paymentId = session.id;
//                             await purchase.save();

//                             return res.status(200).json({
//                                           success: true,
//                                           url: session.url,
//                             });
//               } catch (err) {
//                             return res.status(500).json({
//                                           success: false,
//                                           message: err.message,
//                             });
//               }
// };

// const webhookEndPoints = async (req, res) => {
//               let event;
//               try {
//                             const payloadString = JSON.stringify(req.body, null, 2);
//                             const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

//                             const header = stripe.webhooks.generateTestHeaderString({
//                                           payload: payloadString,
//                                           secret,
//                             });

//                             event = stripe.webhooks.constructEvent(payloadString, header, secret);

//               }
//               catch (err) {
//                             res.json({
//                                           success: false,
//                                           message: err.message
//                             })
//               }
//               // Handle the checkout session completed event
//               if (event.type === "checkout.session.completed") {
//                             console.log("check session complete is called");

//                             try {
//                                           const session = event.data.object;

//                                           const purchase = await CoursePurchase.findOne({
//                                                         paymentId: session.id,
//                                           }).populate({ path: "courseId" });

//                                           if (!purchase) {
//                                                         return res.status(404).json({ message: "Purchase not found" });
//                                           }

//                                           if (session.amount_total) {
//                                                         purchase.amount = session.amount_total / 100;
//                                           }
//                                           purchase.status = "completed";

//                                           // Make all lectures visible by setting `isPreviewFree` to true
//                                           if (purchase.courseId && purchase.courseId.lectures.length > 0) {
//                                                         await Lecture.updateMany(
//                                                                       { _id: { $in: purchase.courseId.lectures } },
//                                                                       { $set: { isPreviewFree: true } }
//                                                         );
//                                           }

//                                           await purchase.save();

//                                           // Update user's enrolledCourses
//                                           await User.findByIdAndUpdate(
//                                                         purchase.userId,
//                                                         { $addToSet: { enrolledCourses: purchase.courseId._id } }, // Add course ID to enrolledCourses
//                                                         { new: true }
//                                           );

//                                           // Update course to add user ID to enrolledStudents
//                                           await Course.findByIdAndUpdate(
//                                                         purchase.courseId._id,
//                                                         { $addToSet: { enrolledStudents: purchase.userId } }, // Add user ID to enrolledStudents
//                                                         { new: true }
//                                           );
//                             } catch (error) {
//                                           console.error("Error handling event:", error);
//                                           return res.status(500).json({ message: "Internal Server Error" });
//                             }
//               }
//               res.status(200).send();
// }

// module.exports = { createCheckOutSession, webhookEndPoints };
const Course = require("../models/course");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Lecture = require("../models/lecture");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const CoursePurchase = require("../models/coursePurchase");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.SECRET_KEY);

const createCheckOutSession = async (req, res) => {
  try {
    // Verify and decode user token
    const token = req.headers.authorization.split(" ")[1];
    const verifyUser = jwt.verify(token, "shivam 123");

    const { courseId } = req.body;

    // Find the course by ID
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course Not Found",
      });
    }

    // Create a new purchase record with "pending" status
    const purchase = new CoursePurchase({
      courseId: course._id,
      userId: verifyUser._id,
      amount: course.coursePrice,

    });

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: course.courseTitle,
              images: [course.courseThumbnailUrl],
            },
            unit_amount: course.coursePrice * 100, // Convert to the smallest currency unit
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:5173/course-progress/${courseId}`,
      cancel_url: `http://localhost:5173/course-details/${courseId}`,
      metadata: {
        courseId: courseId,
        userId: verifyUser._id,
      },
      shipping_address_collection: {
        allowed_countries: ["IN"],
      },
    });

    if (!session.url) {
      return res.status(400).json({
        success: false,
        message: "Error while creating session",
      });
    }

    // Save the purchase record with the payment ID
    purchase.paymentId = session.id;
    await purchase.save();

    return res.status(200).json({
      success: true,
      url: session.url,
      purchase: purchase
    });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create checkout session",
    });
  }
};


const verifyPayment = async (req, res) => {
  try {
    const { sessionId, courseId } = req.body;

    // Retrieve the session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not verified or incomplete.",
      });
    }

    // Update the purchase record in the database
    const purchase = await CoursePurchase.findOne({
      paymentId: sessionId,
    }).populate({ path: "courseId" });

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    if (session.amount_total) {
      purchase.amount = session.amount_total / 100; // Convert to major currency unit
    }
    purchase.status = "completed";

    // Make all lectures visible by setting `isPreviewFree` to true
    if (purchase.courseId && purchase.courseId.lectures.length > 0) {
      await Lecture.updateMany(
        { _id: { $in: purchase.courseId.lectures } },
        { $set: { isPreviewFree: true } }
      );
    }

    await purchase.save();

    // Update user's enrolledCourses
    await User.findByIdAndUpdate(
      purchase.userId,
      { $addToSet: { enrolledCourses: purchase.courseId._id } }, // Add course ID to enrolledCourses
      { new: true }
    );

    // Update course to add user ID to enrolledStudents
    await Course.findByIdAndUpdate(
      purchase.courseId._id,
      { $addToSet: { enrolledStudents: purchase.userId } }, // Add user ID to enrolledStudents
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified and purchase completed",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};




const webhookEndPoints = async (req, res) => {
  let event;

  try {
    const payloadString = JSON.stringify(req.body, null, 2);
    const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

    const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret,
    });

    event = stripe.webhooks.constructEvent(payloadString, header, secret);
    console.log(event.type)
    res.json({
      header: header
    })
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  // Handle the checkout session completed event
  if (event.type === "checkout.session.completed") {
    console.log("check session complete is called");

    try {
      const session = event.data.object;

      const purchase = await CoursePurchase.findOne({
        paymentId: session.id,
      }).populate({ path: "courseId" });
      console.log(purchase)

      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      if (session.amount_total) {
        purchase.amount = session.amount_total / 100;
      }
      purchase.status = "completed";

      // Make all lectures visible by setting `isPreviewFree` to true
      if (purchase.courseId && purchase.courseId.lectures.length > 0) {
        await Lecture.updateMany(
          { _id: { $in: purchase.courseId.lectures } },
          { $set: { isPreviewFree: true } }
        );
      }

      await purchase.save();

      // Update user's enrolledCourses
      await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId._id } }, // Add course ID to enrolledCourses
        { new: true }
      );

      // Update course to add user ID to enrolledStudents
      await Course.findByIdAndUpdate(
        purchase.courseId._id,
        { $addToSet: { enrolledStudents: purchase.userId } }, // Add user ID to enrolledStudents
        { new: true }
      );
    } catch (error) {
      console.error("Error handling event:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  res.status(200).send();
};
const getPurchaseCourse = async (req, res) => {
  try {
    // Extract and verify the token
    const token = req.headers.authorization.split(" ")[1];
    const verifyUser = await jwt.verify(token, 'shivam 123');

    // Fetch the purchase record using multiple arguments (userId and purchaseId)
    const purchase = await CoursePurchase.findOne({
      courseId: req.params.id,  // Purchase ID
      userId: verifyUser._id,  // Ensure the purchase belongs to the logged-in user
    });

    // If no purchase found, return a 404 error
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found or you are not authorized to view it.",
      });
    }

    // Return the purchase data if found
    res.json({
      success: true,
      message: "Purchase data fetched successfully",
      purchase: purchase,
    });

  } catch (err) {
    // Handle unexpected errors (e.g., invalid token, purchase not found)
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



const getAllPurchasedCourse = async (req, res) => {
  try {
    const allPurchaseCourses = await CoursePurchase.find(
      {
        status: "completed"
      }
    ).populate("courseId")

    if (!allPurchaseCourses) {
      res.json({
        success: false,
        message: "No Course Purchased By user"
      })
    }

    res.json({
      success: true,
      message: "All Purchased Course",
      courses: allPurchaseCourses
    })

  }
  catch (err) {
    res.json({
      success: false,
      message: err.message
    })
  }
}

const getCourseDetailsWithPurchaseStatus = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verifyUser = await jwt.verify(token, "shivam 123");

    const course = await Course.findById(req.params.id)
      .populate({ path: "creator" })
      .populate({ path: "lectures" });

    if (!course) {
      return res.json({
        success: false,
        message: "Course Not Found",
      });
    }

    const purchased = await CoursePurchase.findOne({
      userId: verifyUser._id,
      courseId: req.params.id,
    });


    res.json({
      success: true,
      message: "Details fetched successfully",
      course: course,
      purchased: !!purchased,
    });
  } catch (err) {
    res.json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = { createCheckOutSession, webhookEndPoints, verifyPayment, getPurchaseCourse, getCourseDetailsWithPurchaseStatus, getAllPurchasedCourse };
