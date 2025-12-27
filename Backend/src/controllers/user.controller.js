import asyncHandler from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOncloudinary, deleteOnCloudinary } from "../utils/Cloudinary.js";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail, sendOTPEmail } from "../email/emailHandler.js";
import { TestDrive } from "../models/testdrive.model.js";
import { Car } from "../models/car.model.js";
import { Message } from "../models/message.model.js";
import { io, getreciverSocketId } from "../lib/socket.js";

const EMAIL_REGEX = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/;
const NAME_REGEX = /^[a-zA-Z ]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Generate Access and Refresh tokens for a user
 * @param {User} user - User document
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
const generateToken = async (user) => {
    const accessToken = await user.genrateAccesstoken();
    const refreshToken = await user.genrateRefreshtoken();
    user.refreshtoken = refreshToken;
    await user.save();
    return { accessToken, refreshToken };
}

/**
 * Register a new user
 * @route POST /api/v1/user/registeruser
 */
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, name, password, role, phoneno, address } = req.body;

    if ([username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    if (!EMAIL_REGEX.test(email)) {
        throw new ApiError(400, "Invalid email address");
    }
    if (!NAME_REGEX.test(name)) {
        throw new ApiError(400, "Invalid name format");
    }
    if (!PHONE_REGEX.test(phoneno)) {
        throw new ApiError(400, "Invalid phone number");
    }
    if (!PASSWORD_REGEX.test(password)) {
        throw new ApiError(400, "Password must contain at least 8 characters, one uppercase, one lowercase, and one number");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }, { phoneno }]
    });

    if (existingUser) {
        throw new ApiError(409, "User with email, username or phone number already exists");
    }

    let avatar;
    if (req.file) {
        const avatarBuffer = req.file.buffer;
        avatar = await uploadOncloudinary(avatarBuffer, req.file.originalname);
    } else {
        avatar = "https://res.cloudinary.com/ds9c68ixf/image/upload/v1765131420/driveiq-cars/t5ggztpc6isy4jwxinoj.png";
    }

    if (!avatar) {
        throw new ApiError(500, "Error uploading profile image");
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        name,
        password,
        role,
        phoneno,
        address,
        profileImage: avatar,
        isprofilecompleted: true
    });

    const createdUser = await User.findById(user._id).select("-password -refreshtoken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

/**
 * Login user
 * @route POST /api/v1/user/login
 */
const login = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (!username && !email) {
        throw new ApiError(400, "Please enter the Username or email")
    }

    const user = await User.findOne({
        $or: [
            { username },
            { email }
        ]
    });
    if (!user) {
        throw new ApiError(400, "Invalid Credentials")
    }
    const ispasswordcorrect = await user.isPasswordCorrect(password);
    if (!ispasswordcorrect) {
        throw new ApiError(400, "Invalid Password")
    }
    const { refreshToken, accessToken } = await generateToken(user);
    const loggedinuser = await User.findById(user._id).select("-password -refreshtoken");
    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
    await sendWelcomeEmail(email, user.name, process.env.CLIENT_URL);
    return res.
        status(200).
        cookie("refreshtoken", refreshToken, option).
        cookie("accesstoken", accessToken, option).
        json(
            new ApiResponse(200, { user: loggedinuser, accessToken, refreshToken }, "User logged in successfully")
        );
});

/**
 * Logout user
 * @route GET /api/v1/user/logout
 */
const logout = asyncHandler(async (req, res) => {
    const user = req.user

    await User.findByIdAndUpdate(user._id, {
        $set: {
            refreshtoken: undefined
        }
    }, {
        new: true
    })
    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }

    return res.
        status(200).
        clearCookie("accesstoken", option).
        clearCookie("refreshtoken", option).
        json(new ApiResponse(200, {}, "logout successfully"))
});

/**
 * Refresh access token
 * @route GET /api/v1/user/genratenewtoken
 */
const genratenewtoken = asyncHandler(async (req, res) => {
    const oldtoken = req.cookies?.refreshtoken || req.body?.accesstoken

    if (!oldtoken) {
        throw new ApiError(401, "Please Login Again")
    }
    const decodedtoken = jwt.verify(oldtoken, process.env.REFRESHTOKEN_SECRET)

    const user = await User.findById(decodedtoken.id)
    if (!user) {
        throw new ApiError(401, "User not Found")
    }

    if (oldtoken !== user.refreshtoken) {
        throw new ApiError(401, "Refresh code is Invalid")
    }

    const { accessToken, refreshToken } = await generateToken(user);

    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }

    return res.
        status(200).
        cookie("refreshtoken", refreshToken, option).
        cookie("accesstoken", accessToken, option).
        json(
            new ApiResponse(200, { accessToken, refreshToken }, "New Tokens Generated Successfully")
        );
});


/**
 * Change current password
 * @route PATCH /api/v1/user/changepassword
 */
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Please provide old password and new password");
    }
    const user = req.user;
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid old password");
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

/**
 * Update user profile
 * @route PATCH /api/v1/user/updateprofile
 */
const updateProfile = asyncHandler(async (req, res) => {
    const { name, email, phoneno, address, username, profileImage } = req.body;
    const user = req.user;
    if (req.file) {
        const oldprofileImage = user.profileImage;
        const avatarBuffer = req.file.buffer;
        const avatar = await uploadOncloudinary(avatarBuffer, req.file.originalname);
        if (avatar) {
            if (oldprofileImage && !oldprofileImage.includes("github.com")) {
                await deleteOnCloudinary(oldprofileImage);
            }
        }
        user.profileImage = avatar;
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneno) user.phoneno = phoneno;
    if (address) user.address = address;
    if (username) user.username = username;


    await user.save();
    return res.status(200).json(new ApiResponse(200, user, "Profile updated successfully"));
});

/**
 * Get current user details
 * @route GET /api/v1/user/getuser
 */
const getuser = asyncHandler(async (req, res) => {
    const { id } = req.user
    const user = await User.findById(id).select("-password -refreshtoken")
    if (!user) {
        throw new ApiError(400, "Problem fetching user")
    }
    return res.
        status(200).
        json(new ApiResponse(200, user, "User fetched successfully"))
});

/**
 * Complete user profile
 * @route POST /api/v1/user/complete-profile
 */
const completeProfile = asyncHandler(async (req, res) => {
    const user = req.user;
    const { name, email, phoneno, address, username, profileImage, } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneno) user.phoneno = phoneno;
    if (address) user.address = address;
    if (username) user.username = username;


    if (req.file) {
        const avatarBuffer = req.file.buffer;
        const avatar = await uploadOncloudinary(avatarBuffer, req.file.originalname);
        user.profileImage = avatar;
    } else if (profileImage) {
        user.profileImage = profileImage;
    }

    if (user.email && user.username && user.name && user.phoneno && user.address && user.profileImage) {
        user.isprofilecompleted = true;
    } else {
        // Profile intentionally left incomplete if fields missing
    }
    await user.save();
    return res.status(200).json(new ApiResponse(200, { isprofilecompleted: user.isprofilecompleted }, "Profile completed successfully"));
});

/**
 * Initiate Forgot Password Flow
 * @route POST /api/v1/user/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = expiry;
    await user.save({ validateBeforeSave: false });

    try {
        await sendOTPEmail(user.email, user.name, otp);
        return res.status(200).json(new ApiResponse(200, {}, "OTP sent to your email"));
    } catch (error) {
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpiry = undefined;
        await user.save({ validateBeforeSave: false });
        throw new ApiError(500, "Failed to send email. Please try again.");
    }
});

/**
 * Verify OTP
 * @route POST /api/v1/user/verify-otp
 */
const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const user = await User.findOne({
        email,
        resetPasswordOtp: otp,
        resetPasswordOtpExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    return res.status(200).json(new ApiResponse(200, {}, "OTP verified successfully"));
});

/**
 * Reset Password
 * @route POST /api/v1/user/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        throw new ApiError(400, "Email, OTP, and New Password are required");
    }

    const user = await User.findOne({
        email,
        resetPasswordOtp: otp,
        resetPasswordOtpExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiry = undefined;
    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
});

/**
 * Toggle Wishlist
 * @route POST /api/v1/user/wishlist/toggle
 */
const toggleWishlist = asyncHandler(async (req, res) => {
    const { carId } = req.body;
    const userId = req.user._id;

    if (!carId) {
        throw new ApiError(400, "Car ID is required");
    }

    const user = await User.findById(userId);
    const isAdded = user.wishlist.some(id => id.toString() === carId);

    if (isAdded) {
        user.wishlist = user.wishlist.filter(id => id.toString() !== carId);
    } else {
        user.wishlist.push(carId);
    }

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, { wishlist: user.wishlist, isAdded: !isAdded },
            isAdded ? "Removed from wishlist" : "Added to wishlist")
    );
});

/**
 * Get Wishlist
 * @route GET /api/v1/user/wishlist
 */
const getWishlist = asyncHandler(async (req, res) => {
    const user = await req.user.populate({
        path: "wishlist",
        populate: { path: "delear", select: "username email" }
    });

    return res.status(200).json(
        new ApiResponse(200, user.wishlist, "Wishlist fetched successfully")
    );
});


/**
 * Get Dashboard Statistics
 * @route GET /api/v1/user/dashboard-stats
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const userRole = req.user.role;

    // 1. Profile Status (Common)
    const isProfileCompleted = req.user.isprofilecompleted;
    const profileStatus = isProfileCompleted ? "Verified" : "Pending";
    const profileColor = isProfileCompleted ? "text-green-500" : "text-orange-500";


    // --- DEALER / ADMIN DASHBOARD ---
    if (userRole === "dealer" || userRole === "admin") {
        // 1. Active Listings
        let totalListings = await Car.countDocuments({ delear: userId });
        if (totalListings === 0) {
            totalListings = await Car.countDocuments({ delear: userId.toString() });
        }

        // 2. Active Conversations (Unique users chatted with)
        const sentMessages = await Message.distinct("receiver", { sender: userId });
        const receivedMessages = await Message.distinct("sender", { receiver: userId });
        const uniqueContacts = new Set([...sentMessages.map(id => id.toString()), ...receivedMessages.map(id => id.toString())]);
        const activeConversations = uniqueContacts.size;

        // 3. Pending Requests (Test Drives requested ON their cars)
        const pendingRequests = await TestDrive.countDocuments({
            dealer: userId,
            status: 'pending'
        });

        // 4. Upcoming Test Drives (Confirmed appointments)
        const upcomingTestDrives = await TestDrive.countDocuments({
            dealer: userId,
            status: 'approved',
            requesteddate: { $gte: new Date() }
        });

        // 5. Recent Activity (New requests received)
        const recentRequests = await TestDrive.find({ dealer: userId })
            .sort({ updatedAt: -1 })
            .limit(5)
            .populate("car", "maker model year")
            .populate("buyer", "name username");

        const recentActivity = recentRequests.map(td => {
            let title = "";
            let color = "text-blue-500";
            const buyerName = td.buyer?.name || td.buyer?.username || "A user";

            if (td.status === 'pending') {
                title = `${buyerName} requested a test drive for ${td.car?.maker} ${td.car?.model}`;
                color = "text-yellow-500";
            } else if (td.status === 'approved') {
                title = `Test drive confirmed with ${buyerName}`;
                color = "text-green-500";
            } else {
                title = `Test drive ${td.status} for ${td.car?.maker} ${td.car?.model}`;
            }

            return {
                icon: "Car",
                title,
                time: new Date(td.updatedAt).toLocaleDateString(),
                color,
                id: td._id
            };
        });

        // 6. Active Engagements (Upcoming Test Drives list)
        const activeEngagementsDocs = await TestDrive.find({
            dealer: userId,
            status: 'approved',
            requesteddate: { $gte: new Date() }
        })
            .populate("car", "maker model year price")
            .populate("buyer", "username name phoneno")
            .sort({ requesteddate: 1 })
            .limit(3);

        const engagements = activeEngagementsDocs.map(td => {
            const buyerName = td.buyer?.name || td.buyer?.username || "Buyer";
            return {
                id: td._id,
                type: 'appointment',
                title: `${td.car?.year} ${td.car?.maker} ${td.car?.model}`,
                subtitle: `Buyer: ${buyerName} | Date: ${new Date(td.requesteddate).toLocaleDateString()}`,
                statusText: 'View Details',
                icon: 'Calendar',
                color: 'text-purple-600',
                bg: 'bg-purple-100 dark:bg-purple-900/30',
                actionIcon: 'Clock',
                actionColor: 'text-purple-500'
            };
        });

        return res.status(200).json(new ApiResponse(200, {
            stats: [
                { title: "Profile Status", value: profileStatus, color: profileColor },
                { title: "Active Conversations", value: activeConversations, color: "text-indigo-500" },
                { title: "Active Listings", value: totalListings, color: "text-blue-500" },
                { title: "Pending Requests", value: pendingRequests, color: "text-orange-500" },
                { title: "Upcoming Drives", value: upcomingTestDrives, color: "text-teal-500" }
            ],
            activity: recentActivity,
            engagements: engagements,
            isSeller: true
        }, "Seller Dashboard stats fetched successfully"));
    }


    // --- BUYER DASHBOARD ---
    // 2. Active Conversations (Unique users chatted with)
    const sentMessages = await Message.distinct("receiver", { sender: userId });
    const receivedMessages = await Message.distinct("sender", { receiver: userId });
    const uniqueContacts = new Set([...sentMessages.map(id => id.toString()), ...receivedMessages.map(id => id.toString())]);
    const activeConversations = uniqueContacts.size;

    // 3. Pending Requests
    const pendingRequests = await TestDrive.countDocuments({
        buyer: userId,
        status: 'pending'
    });

    // 4. Test Drives Taken (Completed)
    const completedTestDrives = await TestDrive.countDocuments({
        buyer: userId,
        status: 'completed'
    });

    // 5. Recent Activity
    const recentActivityDocs = await TestDrive.find({
        $or: [{ buyer: userId }, { dealer: userId }]
    })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate("car", "maker model year");

    const recentActivity = recentActivityDocs.map(td => {
        let title = "";
        let color = "text-blue-500";
        if (td.status === 'pending') {
            title = `Requested test drive for ${td.car?.maker} ${td.car?.model}`;
            color = "text-yellow-500";
        } else if (td.status === 'approved') {
            title = `Test drive approved for ${td.car?.maker} ${td.car?.model}`;
            color = "text-green-500";
        } else if (td.status === 'rejected') {
            title = `Test drive rejected for ${td.car?.maker} ${td.car?.model}`;
            color = "text-red-500";
        } else {
            title = `Test drive ${td.status} for ${td.car?.maker} ${td.car?.model}`;
        }

        return {
            icon: "Car", // Frontend maps string to icon component
            title,
            time: new Date(td.updatedAt).toLocaleDateString(),
            color,
            id: td._id
        };
    });

    // 6. Active Engagements (Viewings + Wishlist Items)
    const activeTestDrives = await TestDrive.find({
        buyer: userId,
        status: { $in: ["approved", "pending"] },
        requesteddate: { $gte: new Date() }
    })
        .populate("car", "maker model year price")
        .populate("dealer", "username name businessName")
        .limit(3);

    const userWithWishlist = await req.user.populate("wishlist");
    const wishlistItems = userWithWishlist.wishlist.slice(0, 3);

    let engagements = [];

    activeTestDrives.forEach(td => {
        const dealerName = td.dealer?.name || td.dealer?.username || "Dealer";
        engagements.push({
            id: td._id,
            type: 'viewing',
            title: `${td.car?.year} ${td.car?.maker} ${td.car?.model}`,
            subtitle: `Dealer: ${dealerName} | Status: ${td.status === 'approved' ? 'Confirmed' : 'Pending'}`,
            statusText: td.status === 'approved' ? 'View Map' : 'View Details',
            icon: 'Calendar',
            color: 'text-yellow-600',
            bg: 'bg-yellow-100 dark:bg-yellow-900/30',
            actionIcon: 'Clock',
            actionColor: 'text-yellow-500'
        });
    });

    if (engagements.length < 3) {
        wishlistItems.forEach(car => {
            if (engagements.length >= 3) return;
            engagements.push({
                id: car._id,
                type: 'saved',
                title: `${car.year} ${car.maker} ${car.model}`,
                subtitle: `Price: $${car.price} | Status: Saved & Monitoring`,
                statusText: 'Make Offer',
                icon: 'Shield',
                color: 'text-green-600',
                bg: 'bg-green-100 dark:bg-green-900/30',
                actionIcon: 'DollarSign',
                actionColor: 'text-green-500'
            });
        });
    }

    return res.status(200).json(new ApiResponse(200, {
        stats: [
            { title: "Profile Status", value: profileStatus, color: profileColor },
            { title: "Active Conversations", value: activeConversations, color: "text-indigo-500" },
            { title: "Pending Requests", value: pendingRequests, color: "text-teal-500" },
            { title: "Test Drives Taken", value: completedTestDrives, color: "text-yellow-500" }
        ],
        activity: recentActivity,
        engagements: engagements,
        isSeller: false
    }, "Dashboard stats fetched successfully"));
});

export { registerUser, login, logout, genratenewtoken, changePassword, updateProfile, getuser, completeProfile, forgotPassword, verifyOTP, resetPassword, getDashboardStats, toggleWishlist, getWishlist };
