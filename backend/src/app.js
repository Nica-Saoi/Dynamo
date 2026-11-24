const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const authorRoutes = require("./routes/authorRoutes");
const paperRoutes = require("./routes/paperRoutes");
const fileRoutes = require("./routes/fileRoutes");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32
) {
    throw new Error("A strong JWT_SECRET is required");
}

const frontendOrigin =
    process.env.FRONTEND_ORIGIN ||
    "http://localhost:5173";

app.use(cors({
    origin: frontendOrigin,
    credentials: true
}));

app.use(express.json({ limit: "1mb" }));

app.use(cookieParser());

// Protect browser-based write requests from other origins
app.use((req, res, next) => {

    const safeMethods = ["GET", "HEAD", "OPTIONS"];

    if (!safeMethods.includes(req.method)) {

        const origin = req.get("Origin");

        if (
            (origin && origin !== frontendOrigin) ||
            (req.cookies.dynamo_token && !origin)
        ) {
            return res.status(403).json({
                error: "Request origin not permitted"
            });
        }
    }

    next();
});

// Health check
app.get("/api/health", (req, res) => {

    res.json({
        status: "OK",
        application: "Dynamo API"
    });
});

// Existing routes
app.use("/api/authors", authorRoutes);
app.use("/api/papers", paperRoutes);
app.use("/api/files", fileRoutes);

// New routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Central error handler
app.use((error, req, res, next) => {

    if (res.headersSent) {
        return next(error);
    }

    const status = error.status || 500;

    if (status >= 500) {
        console.error("Backend error:", error);
    }

    res.status(status).json({
        error: status >= 500
            ? "Internal server error"
            : error.message
    });
});

module.exports = app;