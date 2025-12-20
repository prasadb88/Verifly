import express from "express";
import { requesttestdrive, mytestdriverequest, getSellerTestDriveRequests, accepttestdrive, cancelTestDrive, completetestdrive, starttestdrive, rejectedtestdrive } from "../controllers/testdrive.controller.js";
import { jwtverify } from "../middleware/protected.middleware.js";

const router = express.Router()

router.post("/requesttestdrive", jwtverify, requesttestdrive)
router.get("/mytestdriverequest", jwtverify, mytestdriverequest)
router.get("/getsellertestdriverequests", jwtverify, getSellerTestDriveRequests)
router.post("/accepttestdrive", jwtverify, accepttestdrive)
router.post("/canceltestdrive", jwtverify, cancelTestDrive)
router.post("/completetestdrive", jwtverify, completetestdrive)
router.post("/starttestdrive", jwtverify, starttestdrive)
router.post("/rejectedtestdrive", jwtverify, rejectedtestdrive)

export default router