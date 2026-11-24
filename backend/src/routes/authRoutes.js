const express = require("express");
const { rateLimit } = require("express-rate-limit");

const {
    registerUser,
    loginUser,
    generateToken
} = require("../services/authService");

const {
    requireAuth
} = require("../middleware/authMiddleware");

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many attempts. Try again later."
    }
});

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
};

// Register a new account
router.post("/register", authLimiter, async (req, res, next) => {

    try {

        const { username, email, password } = req.body;

        const user = await registerUser(
            username,
            email,
            password
        );

        res.status(201).json({
            message: "Account created successfully",
            user
        });

    } catch (error) {
        next(error);
    }
});

// Log in
router.post("/login", authLimiter, async (req, res, next) => {

    try {

        const { email, password } = req.body;

        const user = await loginUser(email, password);

        const token = generateToken(user);

        res.cookie("dynamo_token", token, {
            ...cookieOptions,
            maxAge: 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Login successful",
            user
        });

    } catch (error) {
        next(error);
    }
});

// Log out
router.post("/logout", (req, res) => {

    res.clearCookie(
        "dynamo_token",
        cookieOptions
    );

    res.json({
        message: "Logout successful"
    });
});

// Retrieve the currently authenticated user
router.get("/me", requireAuth, (req, res) => {

    res.json({
        user: req.user
    });
});

module.exports = router;