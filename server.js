const express = require("express");
const app = express()
const client = require("./index.js");
client.logger = require("./Utils/logger.js");
const cases = require("./database/Schema/Case")


app.get("/", (req, res) => {
    res.sendStatus(200)
    console.log('Server Up!');
})

app.get("/api/case", async (req, res) => {
    try {
        const data = await cases.find({});
        res.json(data); // Gunakan res.json agar data dikirim dalam format JSON
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Terjadi kesalahan dalam mengambil data" });
    }
});

//app.listen("1039")

const listener = app.listen("1039", () => {
    client.logger.log("> ✅ • You app is listening on port " + listener.address().port, "success");
});