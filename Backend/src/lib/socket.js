import { Server } from "socket.io"
import http from "http"
import express from "express"
import { socketAuthMiddleware } from "../middleware/socketio.auth.middleware.js"


const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174", process.env.FRONTEND_URL],
        credentials: true,
    },
})

io.use(socketAuthMiddleware)

function getreciverSocketId(userId) {
    return userSocketMap[userId]
}

const userSocketMap = {}

io.on("connection", (socket) => {
    console.log("a user connected", socket.user.name)

    const userId = socket.user_id
    userSocketMap[userId] = socket.id

    io.emit("getonlineusers", Object.keys(userSocketMap))

    socket.on("disconnect", () => {
        console.log("a user disconnected", socket.user.name)
        const userId = socket.user_id
        delete userSocketMap[userId]
        io.emit("getonlineusers", Object.keys(userSocketMap))
    })
})



export { io, app, server, getreciverSocketId }

