const express = require("express");
const cassandra = require("cassandra-driver");
const { client } = require("../config/database");

const router = express.Router();

// GET /api/authors/:id
// Retrieve an author by ID
router.get("/:id", async (req, res) => {
    try {
        const authorId = cassandra.types.Uuid.fromString(
            req.params.id
        );

        const query = `
            SELECT * FROM authors_by_id
            WHERE author_id = ?
        `;

        const result = await client.execute(
            query,
            [authorId],
            { prepare: true }
        );

        if (result.rowLength === 0) {
            return res.status(404).json({
                error: "Author not found"
            });
        }

        res.json(result.first());

    } catch (error) {
        if (error instanceof TypeError) {
            return res.status(400).json({
                error: "Invalid author ID"
            });
        }
        console.error(error);
        res.status(500).json({
            error: "Database error"
        });
    }
});

// POST /api/authors
// Create an author without requiring a user account
router.post("/", async (req, res) => {
    try {
        const { author_name, affiliation, orcid, biography } =
            req.body;

        if (
            typeof author_name !== "string" ||
            !author_name.trim()
        ) {
            return res.status(400).json({
                error: "Author name is required"
            });
        }

        const authorId = cassandra.types.Uuid.random();

        const query = `
            INSERT INTO authors_by_id
            (author_id, author_name, affiliation, orcid, biography)
            VALUES (?, ?, ?, ?, ?)
        `;

        await client.execute(
            query,
            [
                authorId,
                author_name.trim(),
                affiliation ?? null,
                orcid ?? null,
                biography ?? null
            ],
            { prepare: true }
        );

        res.status(201).json({
            message: "Author created",
            author_id: authorId.toString()
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Database error"
        });
    }
});

module.exports = router;