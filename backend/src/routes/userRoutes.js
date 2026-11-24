const express = require("express");

const {
    client
} = require("../config/database");

const {
    requireAuth
} = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all routes in this file
router.use(requireAuth);

// Retrieve the current user's profile
router.get("/me", (req, res) => {

    res.json({
        user: req.user
    });
});

// Retrieve papers uploaded by the current user
router.get("/me/papers", async (req, res, next) => {

    try {

        const result = await client.execute(
            `SELECT * FROM papers_by_user
             WHERE user_id = ?`,
            [req.user.user_id],
            { prepare: true }
        );

        res.json({
            papers: result.rows
        });

    } catch (error) {
        next(error);
    }
});

// Retrieve artifacts uploaded by the current user
router.get("/me/artifacts", async (req, res, next) => {

    try {

        const result = await client.execute(
            `SELECT * FROM artifacts_by_user
             WHERE user_id = ?`,
            [req.user.user_id],
            { prepare: true }
        );

        res.json({
            artifacts: result.rows
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;