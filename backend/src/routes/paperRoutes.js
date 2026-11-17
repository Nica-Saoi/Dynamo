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

// GET /api/papers/:id/files
router.get("/:id/files", async (req, res) => {
    let paperId;

    try {
        paperId = cassandra.types.Uuid.fromString(req.params.id);
    } catch {
        return res.status(400).json({
            error: "Invalid paper ID"
        });
    }

    try {
        const result = await client.execute(
            `SELECT file_id, file_role
             FROM files_by_paper
             WHERE paper_id = ?`,
            [paperId],
            { prepare: true }
        );

        return res.json(result.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Unable to retrieve paper files"
        });
    }
});

// POST /api/papers/:id/files
router.post("/:id/files", async (req, res) => {
    let paperId;
    let fileId;

    try {
        paperId = cassandra.types.Uuid.fromString(req.params.id);
        fileId = cassandra.types.Uuid.fromString(
            req.body.file_id
        );
    } catch {
        return res.status(400).json({
            error: "Invalid paper or file ID"
        });
    }

    const allowedRoles = [
        "primary_pdf",
        "supplementary_material"
    ];

    const fileRole = req.body.file_role;

    if (!allowedRoles.includes(fileRole)) {
        return res.status(400).json({
            error: "Invalid file role"
        });
    }

    try {
        const paperResult = await client.execute(
            "SELECT paper_id FROM papers_by_id WHERE paper_id = ?",
            [paperId],
            { prepare: true }
        );

        const fileResult = await client.execute(
            "SELECT file_id FROM files_by_id WHERE file_id = ?",
            [fileId],
            { prepare: true }
        );

        if (!paperResult.rowLength || !fileResult.rowLength) {
            return res.status(404).json({
                error: "Paper or file not found"
            });
        }

        await client.execute(
            `INSERT INTO files_by_paper
             (paper_id, file_id, file_role)
             VALUES (?, ?, ?)`,
            [paperId, fileId, fileRole],
            { prepare: true }
        );

        return res.status(201).json({
            message: "File associated with paper"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Unable to associate file"
        });
    }
});

module.exports = router;