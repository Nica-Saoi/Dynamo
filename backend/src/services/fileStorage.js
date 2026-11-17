const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const backendDirectory = path.resolve(__dirname, "../..");

const configuredDirectory = process.env.UPLOAD_DIR || "uploads";

const uploadDirectory = path.resolve(
    backendDirectory,
    configuredDirectory
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const fileId = crypto.randomUUID();
        req.uploadedFileId = fileId;
        cb(null, fileId);
    }
});

const upload = multer({
    storage,

    limits: {
        fileSize: 100 * 1024 * 1024,
        files: 1
    },

    fileFilter: (req, file, cb) => {
        const allowedTypes = new Set([
            "application/pdf",
            "text/plain",
            "text/csv",
            "application/zip",
            "application/json"
        ]);

        if (!allowedTypes.has(file.mimetype)) {
            return cb(new Error("Unsupported file type"));
        }

        cb(null, true);
    }
});

module.exports = {
    upload,
    uploadDirectory
};