const fs = require("fs/promises");

async function validateFile(filePath, mimetype) {
    if (mimetype === "application/pdf") {
        const handle = await fs.open(filePath, "r");

        try {
            const header = Buffer.alloc(5);
            const { bytesRead } = await handle.read(
                header, 0, 5, 0
            );

            return bytesRead === 5 &&
                header.toString("ascii") === "%PDF-";
        } finally {
            await handle.close();
        }
    }

    // Other types need their own validation.
    return false;
}

module.exports = { validateFile };