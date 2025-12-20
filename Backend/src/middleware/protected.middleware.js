import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/AsyncHandler.js";
import jwt from 'jsonwebtoken'


const jwtverify = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "Invalid Access")
        }
        const decodedtoken = jwt.verify(token, process.env.ACESSTOKEN_SECRET)
        const user = await User.findById(decodedtoken.id)

        if (!user) {
            throw new ApiError(401, "Invalid Access")
        }
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, "Token not Found")
    }
})
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            throw new ApiError(403, " User role not identified.");
        }
        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, ` You do not have the required role (${roles.join(', ')}).`);
        }
        next();
    };
};
export { jwtverify, authorizeRoles };