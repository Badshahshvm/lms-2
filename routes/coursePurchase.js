const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const checkAuth = require("../middlewares/checkAuth");
const { createCheckOutSession, webhookEndPoints, getCourseDetailsWithPurchaseStatus,verifyPayment,getPurchaseCourse ,getAllPurchasedCourse } = require("../controller/coursePurchase");
router.post("/checkout/create-checkout-session", checkAuth, createCheckOutSession)
router.post("/webhook", bodyParser.raw({ type: "application/json" }), webhookEndPoints)
router.post("/verify", checkAuth, verifyPayment)
router.get("/:id",checkAuth,getPurchaseCourse)
router.get("/course/:id",checkAuth,getCourseDetailsWithPurchaseStatus)
router.get("/",checkAuth,getAllPurchasedCourse )
module.exports = router;