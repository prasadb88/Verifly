import express from "express";
import {
    registerUser,
    login,
    logout,
    genratenewtoken,
    updateProfile,
    getuser,
    changePassword,
    completeProfile,
    forgotPassword,
    verifyOTP,
    resetPassword,
    getDashboardStats,
    toggleWishlist,
    getWishlist,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { jwtverify } from "../middleware/protected.middleware.js";


const router = express.Router();


router.route("/registeruser").post(
    upload.single("profileImage"),
    registerUser
);

router.route("/login").post(login);
router.route("/logout").get(jwtverify, logout);
router.route("/genratenewtoken").get(jwtverify, genratenewtoken);
router.route("/updateprofile").patch(jwtverify, upload.single("profileImage"), updateProfile);
router.route("/getuser").get(jwtverify, getuser);
router.route("/changepassword").patch(jwtverify, changePassword);
router.route("/complete-profile").post(jwtverify, upload.single("profileImage"), completeProfile);
router.route("/dashboard-stats").get(jwtverify, getDashboardStats);
router.route("/wishlist/toggle").post(jwtverify, toggleWishlist);
router.route("/wishlist").get(jwtverify, getWishlist);


// Forgot Password Flow
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);



export default router;