import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import testdriveRouter from "./routes/testdrive.route.js";
import requestRouter from "./routes/request.routes.js";
import carRouter from "./routes/car.route.js";
import { sendWelcomeEmail } from "./email/emailHandler.js";

import { app, server } from "./lib/socket.js";
import "./config/passport.js";
import passport from "passport";
import session from "express-session";
import messageRouter from "./routes/message.route.js";


app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static("public"));
app.set("trust proxy", 1); // Trust first proxy (Render/Heroku/Vercel)
app.use(
    cors({
        origin: [
            process.env.FRONTEND_URL,
            "http://localhost:5173",
            "http://localhost:5174",
            "https://verifly-puce.vercel.app"
        ],
        credentials: true,
    })
);
app.use(cookieParser());

// Server listen logic moved to index.js

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Verifly API",
        status: "Server is running successfully",
        version: "1.0.0"
    });
});



app.use(session({
    secret: process.env.SESSION_SECRET || "verifly-session-secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/testdrive", testdriveRouter);
app.use("/api/v1/request", requestRouter);
app.use("/api/v1/cars", carRouter);
app.use("/api/v1/message", messageRouter);

// Auth Routes
app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    async (req, res) => {
        // Successful authentication
        // Generate tokens for the user
        const user = req.user;
        const accessToken = await user.genrateAccesstoken();
        const refreshToken = await user.genrateRefreshtoken();

        // Set cookies or redirect with tokens
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax'
        };
        await sendWelcomeEmail(user.email, user.name, process.env.CLIENT_URL);
        res.cookie("accesstoken", accessToken, options)
            .cookie("refreshtoken", refreshToken, options)
            .redirect(process.env.FRONTEND_URL || "http://localhost:5174"); // Redirect to frontend
    }
);
export { app, server };
