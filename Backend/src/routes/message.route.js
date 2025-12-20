import express from "express";
import { getMessagesById, sendMessage, deleteChatHistory, getChatpartner, deleteMessage } from "../controllers/message.controller.js";
import { jwtverify } from "../middleware/protected.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();
router.get("/get/:id", jwtverify, getMessagesById)
router.post("/send/:id", jwtverify, upload.array("image", 10), sendMessage)
router.delete("/delete/:id", jwtverify, deleteChatHistory)
router.delete("/delete/message/:id", jwtverify, deleteMessage)
router.get("/getChatpartner", jwtverify, getChatpartner)
export default router   