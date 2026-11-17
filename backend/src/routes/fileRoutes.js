const express = require("express");
const cassandra = require("cassandra-driver");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const { client } = require("../config/database");
const {
    upload,
    uploadDirectory
} = require("../services/fileStorage");

const router = express.Router();

const { createReadStream } = require("fs");

const { validateFile } = require("../services/fileValidation");

async function calculateChecksum(filePath) {
    const hash = crypto.createHash("sha256");

    for await (const chunk of createReadStream(filePath)) {
        hash.update(chunk);
    }

    return hash.digest("hex");
    
}

// POST /api/files
router.post("/", (req, res) => {
    upload.single("file")(req, res, async (error) => {
        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                error: "No file provided"
            });
        }

        try {

            const valid = await validateFile(
                req.file.path,
                req.file.mimetype
            );

            if (!valid) {
                await fs.unlink(req.file.path).catch(() => {});
                return res.status(400).json({
                    error: "Invalid file content"
                });
            }
            const fileId = cassandra.types.Uuid.fromString(
                req.uploadedFileId
            );

            const checksum = await calculateChecksum(req.file.path);

            const query = `
                INSERT INTO files_by_id (
                    file_id,
                    original_filename,
                    storage_key,
                    content_type,
                    file_size,
                    checksum_sha256,
                    uploaded_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            await client.execute(
                query,
                [
                    fileId,
                    req.file.originalname,
                    req.file.filename,
                    req.file.mimetype,
                    req.file.size,
                    checksum,
                    new Date()
                ],
                { prepare: true }
            );

            return res.status(201).json({
                message: "File uploaded successfully",
                file_id: fileId.toString(),
                filename: req.file.originalname,
                size: req.file.size
            });

        } catch (error) {
            console.error("Upload failed:", error);

            // Remove the file if the database write fails.
            await fs.unlink(req.file.path).catch(() => {});

            return res.status(500).json({
                error: "Unable to save file"
            });
        }
    });
});

// GET /api/files/:id
router.get("/:id", async (req, res) => {
    let fileId;

    try {
        fileId = cassandra.types.Uuid.fromString(req.params.id);
    } catch {
        return res.status(400).json({
            error: "Invalid file ID"
        });
    }

    try {
        const result = await client.execute(
            "SELECT * FROM files_by_id WHERE file_id = ?",
            [fileId],
            { prepare: true }
        );

        if (result.rowLength === 0) {
            return res.status(404).json({
                error: "File not found"
            });
        }

        const file = result.first();

        const storageKey = file.storage_key;

        // Only server-generated UUID filenames are permitted.
        if (
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
                .test(storageKey)
        ) {
            return res.status(500).json({
                error: "Invalid stored file reference"
            });
        }

        const filePath = path.join(
            uploadDirectory,
            storageKey
        );

        res.download(
            filePath,
            file.original_filename,
            (error) => {
                if (error) {
                    console.error("Download failed:", error);

                    if (!res.headersSent) {
                        res.status(
                            error.code === "ENOENT" ? 404 : 500
                        ).json({
                            error: "Unable to download file"
                        });
                    }
                }
            }
        );

    } catch (error) {
        console.error(error);

        if (!res.headersSent) {
            res.status(500).json({
                error: "Database error"
            });
        }
    }
});

module.exports = router;