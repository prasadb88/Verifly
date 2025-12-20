import { Message } from "../models/message.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { uploadOncloudinary, deleteOnCloudinary } from "../utils/Cloudinary.js";
import { getreciverSocketId, io } from "../lib/socket.js";

const extractPublicId = (url) => {
    if (!url) return null;
    try {
        const urlParts = url.split("/");
        const lastPart = urlParts[urlParts.length - 1];
        const namePart = lastPart.split(".")[0];
        return `driveiq-cars/${namePart}`;
    } catch (error) {
        return null;
    }
};

const getMessagesById = asyncHandler(async (req, res) => {
    const user1_id = req.user._id;
    const { id: user2_id } = req.params;

    const messages = await Message.find({ $or: [{ sender: user1_id, receiver: user2_id }, { sender: user2_id, receiver: user1_id }] })
    if (!messages) {
        throw new ApiError(400, "No Messages Found")
    }

    // Mark received messages as read
    await Message.updateMany(
        { sender: user2_id, receiver: user1_id, isRead: false },
        { $set: { isRead: true } }
    );

    return res.status(200).json(new ApiResponse(200, messages, "Messages Fetched Successfully"))
})

const sendMessage = asyncHandler(async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: user2_id } = req.params;
        const user1_id = req.user._id;

        let imageUrl;


        if (req.files && req.files.length > 0) {
            const imageFile = req.files[0];
            imageUrl = await uploadOncloudinary(imageFile.buffer, imageFile.originalname);
        }


        const newMessage = await Message.create({
            sender: user1_id,
            receiver: user2_id,
            message: text,
            image: imageUrl
        })

        const populatedMessage = await newMessage.populate("sender", "name username profileImage");

        const receiverSocketId = getreciverSocketId(user2_id)
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", populatedMessage)
        }
        return res.status(200).json(new ApiResponse(200, newMessage, "Message Sent Successfully"))
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error, "Failed To Send Message"))
    }
})

const deleteChatHistory = asyncHandler(async (req, res) => {
    const user1_id = req.user._id;
    const { id: user2_id } = req.params;

    // Correct query: Messages where (sender=user1 AND receiver=user2) OR (sender=user2 AND receiver=user1)
    const query = {
        $or: [
            { sender: user1_id, receiver: user2_id },
            { sender: user2_id, receiver: user1_id }
        ]
    };

    const messages = await Message.find(query);

    if (!messages || messages.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No messages to delete"));
    }

    // Delete images from Cloudinary
    const deleteImagePromises = messages
        .filter(msg => msg.image)
        .map(msg => {
            const publicId = extractPublicId(msg.image);
            if (publicId) return deleteOnCloudinary(publicId);
        });

    if (deleteImagePromises.length > 0) {
        await Promise.all(deleteImagePromises);
    }

    await Message.deleteMany(query);

    return res.status(200).json(new ApiResponse(200, null, "Chat history deleted successfully"));
})

const getChatpartner = asyncHandler(async (req, res) => {
    try {
        const user1_id = req.user._id;

        const partners = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: user1_id },
                        { receiver: user1_id }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$sender", user1_id] },
                            then: "$receiver",
                            else: "$sender"
                        }
                    },
                    lastMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [{
                                $and: [
                                    { $eq: ["$receiver", user1_id] },
                                    { $eq: ["$isRead", false] }
                                ]
                            }, 1, 0]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "partnerDetails"
                }
            },
            {
                $unwind: "$partnerDetails"
            },
            {
                $sort: { "lastMessage.createdAt": -1 }
            },
            {
                $project: {
                    _id: "$partnerDetails._id",
                    username: "$partnerDetails.username",
                    email: "$partnerDetails.email",
                    avatar: "$partnerDetails.avatar",
                    lastMessage: {
                        message: "$lastMessage.message",
                        image: "$lastMessage.image",
                        createdAt: "$lastMessage.createdAt",
                        sender: "$lastMessage.sender"
                    },
                    unreadCount: 1
                }
            }
        ]);

        return res.status(200).json(new ApiResponse(200, partners, "Chat Partners Fetched Successfully"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error.message, "Failed To Get Chat Partner"));
    }
})

const deleteMessage = asyncHandler(async (req, res) => {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
        throw new ApiError(404, "Message not found");
    }

    // Strict check: Only sender can delete
    if (message.sender.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only delete messages you sent.");
    }

    // Delete image from Cloudinary if exists
    if (message.image) {
        const publicId = extractPublicId(message.image);
        if (publicId) {
            await deleteOnCloudinary(publicId);
        }
    }

    await Message.findByIdAndDelete(messageId);

    // Emit socket event for real-time removal
    const receiverId = message.sender.toString() === userId.toString() ? message.receiver : message.sender;
    const receiverSocketId = getreciverSocketId(receiverId);
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeleted", messageId);
    }

    return res.status(200).json(new ApiResponse(200, messageId, "Message deleted successfully"));
});

export { getMessagesById, sendMessage, deleteChatHistory, getChatpartner, deleteMessage }