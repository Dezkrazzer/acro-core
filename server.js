const express = require("express");
const app = express()
const client = require("./index.js");
client.logger = require("./Utils/logger.js");
const cases = require("./database/Schema/Case")
const { json, urlencoded } = require("body-parser")
const { resolve } = require("path")

app.set("view engine", "ejs");
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(express.static(resolve(__dirname, "views")));
app.use(express.static(resolve(__dirname, "public")));

/* app.get("/", (req, res) => {
    res.sendStatus(200)
    console.log('Server Up!');
}) */

app.get("/", (req, res) => {
    res.render("index", { bot: client, req, res });
});

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
    client.logger.log("> ✅ • You app is listening on port 1039", "success");
});