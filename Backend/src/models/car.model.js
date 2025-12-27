import mongoose from "mongoose";
import { User } from "./user.model.js";

const CarSchema = new mongoose.Schema({
    delear: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: false
    },
    price: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        required: true
    }],
    mileage: {
        type: String,
        required: true
    },
    transmission: {
        type: String,
        enum: ["Manual", "Automatic"],
        required: true
    },
    fueltype: {
        type: String,
        enum: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG", "LPG", "Other"],
        required: true
    },
    registrationnumber: {
        type: String,
        required: false
    },
    owner: {
        type: String,
        required: true
    },
    damage: {
        type: String,
    },
    damageImages: [{
        type: String
    }],
    insurance: {
        type: String,
    },
    insurancevalidity: {
        type: String,
    },
    insurancecompany: {
        type: String,
    },
    insurancepremium: {
        type: String,
    },
    insurancestatus: {
        type: String,
        enum: ["Active", "Inactive"],
        required: true
    },
    insurancepremium: {
        type: String,
    },
    insurancecompany: {
        type: String,
    },
    insurancevalidity: {
        type: String,
    },
    chassisnumber: {
        type: String,
    },
    enginenumber: {
        type: String,
    },
    registrationdate: {
        type: String,
    },
    registrationplace: {
        type: String,
    },
    maker: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    }

}, { timestamps: true })

export const Car = mongoose.model("Car", CarSchema)
