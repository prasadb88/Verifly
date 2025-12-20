import asyncHandler from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Request } from "../models/request.model.js";
import { User } from "../models/user.model.js";

const requestRoleChange = asyncHandler(async (req, res) => {
    const { requestedRole, reason } = req.body;
    const userId = req.user._id;

    if (!requestedRole || !['dealer', 'buyer', 'admin'].includes(requestedRole)) {
        throw new ApiError(400, "Invalid or missing requested role");
    }

    if (req.user.role === requestedRole) {
        throw new ApiError(400, "You already have this role");
    }

    const existingRequest = await Request.findOne({
        user: userId,
        status: "pending"
    });

    if (existingRequest) {
        throw new ApiError(400, "You already have a pending request");
    }

    const request = await Request.create({
        user: userId,
        requestedRole,
        reason
    });

    return res.status(201).json(
        new ApiResponse(201, request, "Role change request submitted successfully")
    );
});

const getAllRequests = asyncHandler(async (req, res) => {
    const requests = await Request.find()
        .populate("user", "username email name role")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, requests, "All requests fetched successfully")
    );
});

const updateRequestStatus = asyncHandler(async (req, res) => {
    const { requestId, status } = req.body;

    if (!requestId || !status || !['approved', 'rejected'].includes(status)) {
        throw new ApiError(400, "Invalid request ID or status");
    }

    const request = await Request.findById(requestId);

    if (!request) {
        throw new ApiError(404, "Request not found");
    }

    if (request.status !== "pending") {
        throw new ApiError(400, "Request is already processed");
    }

    request.status = status;
    await request.save();

    if (status === "approved") {
        const user = await User.findById(request.user);
        if (user) {
            user.role = request.requestedRole;
            await user.save({ validateBeforeSave: false });
        }
    }

    return res.status(200).json(
        new ApiResponse(200, request, `Request ${status} successfully`)
    );
});

const getMyRequests = asyncHandler(async (req, res) => {
    const requests = await Request.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(
        new ApiResponse(200, requests, "Your requests fetched successfully")
    );
});

export { requestRoleChange, getAllRequests, updateRequestStatus, getMyRequests };
