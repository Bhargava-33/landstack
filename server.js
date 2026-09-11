const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json());

// Load mock land database
const dataPath = path.join(__dirname, "data", "landRecords.json");
const landRecords = JSON.parse(fs.readFileSync(dataPath, "utf8"));

// Serve frontend files
app.use(express.static(__dirname));

// Home
app.get("/api", (req, res) => {
    res.json({
        message: "LANDSTACK API is running",
        status: "success"
    });
});

// Get all land records
app.get("/api/land", (req, res) => {
    res.json(landRecords);
});

// Get one land record by survey number
app.get("/api/land/:surveyNo", (req, res) => {

    const surveyNo = decodeURIComponent(req.params.surveyNo);

    const record = landRecords[surveyNo];

    if (!record) {
        return res.status(404).json({
            success: false,
            message: "Survey number not found"
        });
    }

    res.json({
        success: true,
        data: record
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`LANDSTACK running at http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
});