const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
    },
    paymentId: {
        type: String,
        required: true,
    },
},
    { timestamps: true });

const purchaseModel = mongoose.model("Purchase", purchaseSchema);
module.exports = purchaseModel;
