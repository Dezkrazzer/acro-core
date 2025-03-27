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
        res.json(data); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while retrieving data" });
    }
});

app.listen("1039", () => {
    client.logger.log("> ✅ • You app is listening on port " + listener.address().port, "success");
});