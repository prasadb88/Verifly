import express from "express";
import { jwtverify, authorizeRoles } from "../middleware/protected.middleware.js";
import {
    requestRoleChange,
    getAllRequests,
    updateRequestStatus,
    getMyRequests
} from "../controllers/request.controller.js";

const router = express.Router();

// User routes
router.post("/request", jwtverify, requestRoleChange);
router.get("/myrequests", jwtverify, getMyRequests);

// Admin routes
router.get("/admin/requests", jwtverify, authorizeRoles("admin"), getAllRequests);
router.post("/admin/request-status", jwtverify, authorizeRoles("admin"), updateRequestStatus);

export default router;
