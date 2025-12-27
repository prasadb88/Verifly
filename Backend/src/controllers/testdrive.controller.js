import asyncHandler from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { TestDrive } from "../models/testdrive.model.js";
import { Car } from "../models/car.model.js";
import { User } from "../models/user.model.js";
import { io, getreciverSocketId } from "../lib/socket.js";

/**
 * @desc Request a test drive
 * @route POST /api/v1/testdrive/request
 * @access Private (Buyer)
 */
const requesttestdrive = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id || req.user).select("username email fullname phoneno")
    const { carId, requestedtime, requestedDate } = req.body

    if (!user) throw new ApiError(401, "User Not Found")

    if (!carId) throw new ApiError(400, "Car ID is required")

    const car = await Car.findById(carId)
    if (!car) throw new ApiError(404, "Car Not Found")

    if (!car.delear) {
        throw new ApiError(400, "Test drive must be associated with a verified dealer")
    }

    const testdrive = await TestDrive.create({
        car: carId,
        buyer: user._id,
        dealer: car.delear,
        requestedtime: requestedtime,
        requesteddate: requestedDate,
        status: "pending"
    })

    const dealerSocketId = getreciverSocketId(car.delear);
    if (dealerSocketId) {
        io.to(dealerSocketId).emit("testDriveRequest", {
            ...testdrive._doc,
            car: { maker: car.maker, model: car.model, year: car.year, images: car.images },
            buyer: { username: user.username, email: user.email }
        });
    }

    return res.status(201).
        json(new ApiResponse(201, testdrive, "Test drive request sent successfully"))
})

/**
 * @desc Get all test drive requests for the current buyer
 * @route GET /api/v1/testdrive/my-requests
 * @access Private (Buyer)
 */
const mytestdriverequest = asyncHandler(async (req, res) => {
    const user = req.user
    const requests = await TestDrive.find({ buyer: user._id })
        .populate('car', 'maker model year images')
        .populate('dealer', 'username email fullname address');

    return res.status(200).
        json(new ApiResponse(200, requests, "Test drive requests fetched successfully"))
})

/**
 * @desc Get all test drive requests received by the seller (dealer)
 * @route GET /api/v1/testdrive/seller-requests
 * @access Private (Dealer)
 */
const getSellerTestDriveRequests = asyncHandler(async (req, res) => {
    const user = req.user

    const requests = await TestDrive.find({ dealer: user._id })
        .populate('car', 'maker model year color price images')
        .populate('buyer', 'username email fullname phoneno avatar')
        .populate('dealer', 'name email phone _id')
        .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, requests, "Seller requests fetched successfully"));
});

/**
 * @desc Accept a test drive request
 * @route PUT /api/v1/testdrive/accept
 * @access Private (Dealer)
 */
const accepttestdrive = asyncHandler(async (req, res) => {
    const { id } = req.body

    const testdrive = await TestDrive.findById(id)

    if (!testdrive) {
        throw new ApiError(404, "Test Drive Request Not Found")
    }

    if (testdrive.status !== "pending") {
        throw new ApiError(400, "Test Drive Request is not in pending state")
    }

    testdrive.status = "accepted"
    await testdrive.save({ validateBeforeSave: false })

    const buyerSocketId = getreciverSocketId(testdrive.buyer);
    if (buyerSocketId) {
        io.to(buyerSocketId).emit("testDriveStatusUpdate", {
            id: testdrive._id,
            status: "accepted"
        });
    }

    return res.status(200).
        json(new ApiResponse(200, testdrive, "Test drive request accepted successfully"))
})

/**
 * @desc Reject a test drive request
 * @route PUT /api/v1/testdrive/reject
 * @access Private (Dealer)
 */
const rejectedtestdrive = asyncHandler(async (req, res) => {
    const { id, message } = req.body

    const testdrive = await TestDrive.findById(id)

    if (!testdrive) {
        throw new ApiError(404, "Test Drive Request Not Found")
    }
    if (!message) {
        throw new ApiError(400, "Rejection message is required")
    }

    testdrive.rejectionReason = message
    testdrive.status = "rejected"
    await testdrive.save({ validateBeforeSave: false })

    const buyerSocketId = getreciverSocketId(testdrive.buyer);
    if (buyerSocketId) {
        io.to(buyerSocketId).emit("testDriveStatusUpdate", {
            id: testdrive._id,
            status: "rejected",
            rejectionReason: message
        });
    }

    return res.status(200).
        json(new ApiResponse(200, "", "Test drive rejected successfully"))

})

/**
 * @desc Start a test drive (change status to in-progress)
 * @route PUT /api/v1/testdrive/start
 * @access Private (Dealer)
 */
const starttestdrive = asyncHandler(async (req, res) => {
    let { id } = req.body;

    // Handle nested ID object if frontend sends it wrapped
    if (typeof id === "object" && id !== null && id.id) {
        id = id.id;
    }

    const testdrive = await TestDrive.findById(id)

    if (!testdrive) {
        throw new ApiError(404, "Test Drive Request Not Found")
    }

    if (testdrive.status !== "accepted") {
        throw new ApiError(400, "Test Drive must be accepted before starting")
    }

    testdrive.status = "in-progress"
    await testdrive.save({ validateBeforeSave: false })

    const buyerSocketId = getreciverSocketId(testdrive.buyer);
    if (buyerSocketId) {
        io.to(buyerSocketId).emit("testDriveStatusUpdate", {
            id: testdrive._id,
            status: "in-progress"
        });
    }

    return res.status(200).
        json(new ApiResponse(200, "", "Test drive started successfully"))

})

/**
 * @desc Complete a test drive
 * @route PUT /api/v1/testdrive/complete
 * @access Private (Dealer)
 */
const completetestdrive = asyncHandler(async (req, res) => {
    let { id } = req.body

    if (typeof id === "object" && id !== null && id.id) {
        id = id.id;
    }

    const testdrive = await TestDrive.findById(id)

    if (!testdrive) {
        throw new ApiError(404, "Test Drive Request Not Found")
    }
    if (testdrive.status !== "in-progress") {
        throw new ApiError(400, "Test Drive must be in-progress to complete")
    }
    testdrive.status = "completed"
    await testdrive.save({ validateBeforeSave: false })

    const buyerSocketId = getreciverSocketId(testdrive.buyer);
    if (buyerSocketId) {
        io.to(buyerSocketId).emit("testDriveStatusUpdate", {
            id: testdrive._id,
            status: "completed"
        });
    }

    return res.status(200).
        json(new ApiResponse(200, "", "Test drive completed successfully"))

})

/**
 * @desc Cancel a test drive
 * @route PUT /api/v1/testdrive/cancel
 * @access Private (Buyer/Dealer)
 */
const cancelTestDrive = asyncHandler(async (req, res) => {
    const { id } = req.body;

    const testDrive = await TestDrive.findById(id);

    if (!testDrive) {
        throw new ApiError(404, "Test Drive request not found");
    }

    if (['completed', 'rejected'].includes(testDrive.status)) {
        throw new ApiError(400, `Test Drive request is already ${testDrive.status}. Cannot cancel.`);
    }

    // Reset car status if applicable
    const car = await Car.findById(testDrive.car);
    if (car && car.isTestDriving) {
        car.isTestDriving = false;
        await car.save();
    }

    testDrive.status = "cancelled"
    await testDrive.save({ validateBeforeSave: false })

    if (testDrive.dealer) {
        const dealerSocketId = getreciverSocketId(testDrive.dealer);
        if (dealerSocketId) {
            io.to(dealerSocketId).emit("testDriveStatusUpdate", {
                id: testDrive._id,
                status: "cancelled"
            });
        }
    }

    return res.status(200).
        json(new ApiResponse(200, "", "Test drive cancelled successfully"))
})


export { requesttestdrive, mytestdriverequest, getSellerTestDriveRequests, accepttestdrive, cancelTestDrive, completetestdrive, starttestdrive, rejectedtestdrive }