import asyncHandler from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { TestDrive } from "../models/testdrive.model.js";
import { Car } from "../models/car.model.js";
import { User } from "../models/user.model.js";
import { io, getreciverSocketId } from "../lib/socket.js";

const requesttestdrive = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id || req.user).select("username email fullname phoneno")
    const { carId, requestedtime, requestedDate } = req.body
    if (!user) {
        throw new ApiError(400, "User Not Found")
    }
    if (!carId) {
        throw new ApiError(400, "Car Not Found")
    }
    const car = await Car.findById(carId)
    if (!car) {
        throw new ApiError(400, "Car Not Found")
    }
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

    return res.status(200).
        json(new ApiResponse(200, testdrive, "Request Send To the the Seller"))
})

const mytestdriverequest = asyncHandler(async (req, res) => {
    const user = req.user
    const requests = await TestDrive.find({ buyer: user._id })
        .populate('car', 'maker model year images')
        .populate('dealer', 'username email fullname address');

    return res.status(200).
        json(new ApiResponse(200, requests, "request feature sucessfully"))
})

const getSellerTestDriveRequests = asyncHandler(async (req, res) => {
    const user = req.user

    const requests = await TestDrive.find({ dealer: user._id })
        .populate('car', 'maker model year color price images')
        .populate('buyer', 'username email fullname phoneno avatar')
        .populate('dealer', 'name email phone _id')
        .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, requests, "request feature sucessfully"));
});

const accepttestdrive = asyncHandler(async (req, res) => {
    const { id } = req.body

    const testdrive = await TestDrive.findById(id)

    if (!testdrive) {
        throw new ApiError(400, "Test Drive Request Not Found")
    }

    if (testdrive.status !== "pending") {
        throw new ApiError(400, "TestDrive Request is not pending")
    }

    testdrive.status = "accepted"
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
        json(new ApiResponse(200, testdrive, "testDrive Aceppted Scessfully"))
})

const rejectedtestdrive = asyncHandler(async (req, res) => {
    const { id } = req.body
    const { message } = req.body

    const testdrive = await TestDrive.findById(id)

    if (!testdrive) {
        throw new ApiError(400, "Test Drive Request Not Found")
    }
    if (!message) {
        throw new ApiError(400, "message is required")
    }

    testdrive.rejectionReason = message
    testdrive.status = "rejected"
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
        json(new ApiResponse(200, "", "testDrive Rejected Scessfully"))

})
const starttestdrive = asyncHandler(async (req, res) => {
    let { id } = req.body;

    if (typeof id === "object" && id !== null && id.id) {
        id = id.id;
    }

    const testdrive = await TestDrive.findById(id)

    if (!testdrive) {
        throw new ApiError(400, "Test Drive Request Not Found")
    }

    if (testdrive.status !== "accepted") {
        throw new ApiError(400, "Test Drive Request Not Accepted")
    }

    testdrive.status = "in-progress"
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
        json(new ApiResponse(200, "", "testDrive Start Scessfully"))

})

const completetestdrive = asyncHandler(async (req, res) => {
    let { id } = req.body

    if (typeof id === "object" && id !== null && id.id) {
        id = id.id;
    }

    const testdrive = await TestDrive.findById(id)

    if (!testdrive) {
        throw new ApiError(400, "Test Drive Request Not Found")
    }
    if (testdrive.status !== "in-progress") {
        throw new ApiError(400, "Test Drive Request Not Accepted")
    }
    testdrive.status = "completed"
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
        json(new ApiResponse(200, "", "testDrive Start Scessfully"))

})
const cancelTestDrive = asyncHandler(async (req, res) => {
    const { id } = req.body;

    const testDrive = await TestDrive.findById(id);

    if (!testDrive) {
        res.status(404);
        throw new Error('Test Drive request not found.');
    }

    if (['completed', 'rejected'].includes(testDrive.status)) {
        res.status(400);
        throw new Error(`Test Drive request is already ${testDrive.status}. Cannot cancel.`);
    }


    const car = await Car.findById(testDrive.car);
    if (car && car.isTestDriving) {
        car.isTestDriving = false;
        await car.save();
    }
    testDrive.status = "cancelled"
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
        json(new ApiResponse(200, "", "testDrive cancelled Scessfully"))
})



export { requesttestdrive, mytestdriverequest, getSellerTestDriveRequests, accepttestdrive, cancelTestDrive, completetestdrive, starttestdrive, rejectedtestdrive }