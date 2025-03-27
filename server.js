const express = require("express");
const app = express()
const client = require("./index.js");
client.logger = require("./Utils/logger.js");

app.get("/", (req, res) => {
    res.sendStatus(200)
    console.log('Server Up!');
})

//app.listen("1039")

const listener = app.listen("1039", () => {
    client.logger.log("> ✅ • You app is listening on port " + listener.address().port, "success");
});