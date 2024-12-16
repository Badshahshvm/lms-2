const express = require("express");
require("dotenv").config()
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const fileUpload = require("express-fileupload")
const userRoute = require("./routes/user")
const courseRoute = require("./routes/course")
const coursePurchaseRoute = require("./routes/coursePurchase")
const courseProgressRoute = require("./routes/courseProgress")
mongoose.connect(process.env.MONGO_URI).then(() => {
              console.log("connected")
}).catch(() => console.log("not connected"))


app.use(express.json())
app.use(cors())
app.use(fileUpload({
              useTempFiles: true,
              tempFileDir: '/tmp/'
}))
app.use("/api/v1/auth", userRoute)
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", coursePurchaseRoute)
app.use("/api/v1/progress", courseProgressRoute)
app.listen(process.env.PORT, () => {
              console.log("server is running")
})


