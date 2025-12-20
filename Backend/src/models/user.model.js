import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    isGoogleUser: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ["dealer", "buyer", "admin"],
        default: "buyer"
    },
    username: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true
    },
    address: {
        type: String,
        trim: true
    },
    profileImage: {
        type: String,
    },
    phoneno: {
        type: Number,
    },
    refreshtoken: {
        type: String,

    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car'
    }],
    isprofilecompleted: {
        type: Boolean,
        default: false
    },
    resetPasswordOtp: {
        type: String, // Storing raw 6 digit code
    },
    resetPasswordOtpExpiry: {
        type: Date
    }
}, {
    timestamps: true
});

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    if (!this.password) return;

    this.password = await bcrypt.hash(this.password, 8);
});

UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

UserSchema.methods.genrateAccesstoken = async function () {
    return jwt.sign({
        id: this._id,
        username: this.username,
        email: this.email,
        fullname: this.fullname
    }, process.env.ACESSTOKEN_SECRET, { expiresIn: process.env.ACESSTOKEN_EXPIRY })
}

UserSchema.methods.genrateRefreshtoken = async function () {
    return jwt.sign({
        id: this._id
    }, process.env.REFRESHTOKEN_SECRET, { expiresIn: process.env.REFRESHTOKEN_EXPIRY })
}


export const User = mongoose.model("User", UserSchema)
