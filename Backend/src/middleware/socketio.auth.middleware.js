import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"


export const socketAuthMiddleware = async (socket, next) => {
    try {
        const cookies = socket.handshake.headers.cookie;
        const token = cookies?.split(";")
            .find((cookie) => cookie.trim().startsWith("accesstoken="))
            ?.split("=")[1];

        if (!token) {
            return next(new Error("Authentication error"));

        }
        const decoded = jwt.verify(token, process.env.ACESSTOKEN_SECRET)
        if (!decoded) {
            return next(new Error("Authentication error"));
        }
        const user = await User.findById(decoded.id)
        if (!user) {
            return next(new Error("Authentication error"));
        }
        socket.user = user;
        socket.user_id = decoded.id.toString();

        console.log(`socket is authenticated for user ${user.name}`)
        return next()
    } catch (error) {
        console.log(`socket authentication failed for user ${user.name}`)
        return next(new Error("Authentication error"))
    }

}