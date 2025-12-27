import mongoose from "mongoose";
import { User } from "./user.model.js";
import { Car } from "./car.model.js"

const TestDriveSchema = new mongoose.Schema({
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Car
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },
    dealer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "approved", "rejected", "completed", "cancelled", "in-progress"],
        default: "pending"
    },
    requesteddate: {
        type: Date,
        required: true
    },
    requestedtime: {
        type: String,
        required: true
    },
    rejectionReason: {
        type: String,
    },
    testdrivecompleted: {
        type: Boolean,
        default: false
    },
    confirmeddate: {
        type: Date,
    },
    confirmedtime: {
        type: String,
    },

}, { timestamps: true })

export const TestDrive = mongoose.model("TestDrive", TestDriveSchema)