const mongoose = require("mongoose");
const lectureProgressSchema = new mongoose.Schema({
    lectureId: { type: String },
    viewed: { type: Boolean }
});
const progressSchema = new mongoose.Schema({
    userId: { type: String },
    courseId: { type: String },
    completed: { type: Boolean },
    lectureProgress: [lectureProgressSchema]

})

const progressModel = mongoose.model("Progress", progressSchema);
module.exports = progressModel;