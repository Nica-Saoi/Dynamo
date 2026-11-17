const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authorRoutes = require("./routes/authorRoutes");
const paperRoutes = require("./routes/paperRoutes");
const fileRoutes = require("./routes/fileRoutes");

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_ORIGIN ||
        "http://localhost:5173"
}));

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        application: "Dynamo API"
    });
});

app.use("/api/authors", authorRoutes);
app.use("/api/papers", paperRoutes);
app.use("/api/files", fileRoutes);
module.exports = app;