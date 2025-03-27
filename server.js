const express = require("express");
const app = express()
const client = require("./index.js");
client.logger = require("./Utils/logger.js");
const cases = require("./database/Schema/Case")

const data = async () => {
    const data = await cases.find({})
    return data
}

app.get("/", (req, res) => {
    res.sendStatus(200)
    console.log('Server Up!');
})

app.get("/api/case", (req, res) => {
    res.send(data)
})

//app.listen("1039")

const listener = app.listen("1039", () => {
    client.logger.log("> ✅ • You app is listening on port " + listener.address().port, "success");
});