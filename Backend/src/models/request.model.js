import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    requestedRole: {
        type: String,
        enum: ["dealer", "buyer", "admin"],
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    reason: {
        type: String,
        trim: true
    }
}, { timestamps: true });

export const Request = mongoose.model("Request", requestSchema);
