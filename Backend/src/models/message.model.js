import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
    },
    image: {
        type: String,
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Message = mongoose.model("Message", MessageSchema);
