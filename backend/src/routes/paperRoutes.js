const express = require("express");
const cassandra = require("cassandra-driver");
const { client } = require("../config/database");

const router = express.Router();

// GET /api/papers/:id
router.get("/:id", async (req, res) => {
    let paperId;

    try {
        paperId = cassandra.types.Uuid.fromString(
            req.params.id
        );
    } catch {
        return res.status(400).json({
            error: "Invalid paper ID"
        });
    }

    try {
        const query = `
            SELECT * FROM papers_by_id
            WHERE paper_id = ?
        `;

        const result = await client.execute(
            query,
            [paperId],
            { prepare: true }
        );

        if (result.rowLength === 0) {
            return res.status(404).json({
                error: "Paper not found"
            });
        }

        res.json(result.first());

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Database error"
        });
    }
});

module.exports = router;