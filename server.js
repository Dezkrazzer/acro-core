module.exports = function startServer(client) {
const express = require("express");
const app = express()
//const client = require("./index.js");
client.logger = require("./Utils/logger.js");
const cases = require("./database/Schema/Case")
const { json, urlencoded } = require("body-parser")
const { resolve } = require("path")
const { minify } = require('html-minifier');
const JavaScriptObfuscator = require('javascript-obfuscator');

app.set("view engine", "ejs");
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(express.static(resolve(__dirname, "views")));
app.use(express.static(resolve(__dirname, "public")));

// MENGACAK SCRIPT DI HTML
function obfuscateInlineScripts(html) {
    return html.replace(/<script>([\s\S]*?)<\/script>/g, (match, jsCode) => {
      const obfuscated = JavaScriptObfuscator.obfuscate(jsCode, {
        compact: true,
        controlFlowFlattening: true,
        deadCodeInjection: true,
        stringArray: true,
        rotateStringArray: true,
      }).getObfuscatedCode();
  
      return `<script>${obfuscated}</script>`;
    });
  }

/* app.get("/", (req, res) => {
    res.sendStatus(200)
    console.log('Server Up!');
}) */

/*app.get("/", (req, res) => {
    res.render("index", { bot: client, req, res });
});*/

app.get('/', (req, res) => {
    res.render('index', { bot: client, req, res }, (err, html) => {
      if (err) return res.status(500).send(err.message);

      const obfuscatedHTML = obfuscateInlineScripts(html);
  
      const minifiedHtml = minify(obfuscatedHTML, {
        collapseWhitespace: true,
        removeComments: true,
        //minifyJS: true,
        minifyCSS: true,
        ignoreCustomFragments: [/<%[\s\S]*?%>/]  // agar tag EJS tidak rusak
      });
  
      res.send(minifiedHtml);
    });
  });

app.get('/team', async (req, res) => {
  try {
    const guild = client.guilds.cache.get("954173179042091028");
    if (!guild) return res.status(404).send("Guild not found");

    console.log("client.guilds:", client.guilds);
    console.log("client.guilds.cache:", client.guilds?.cache);

    const rootRole = guild.roles.cache.find(role => role.name.toLowerCase() === "root");
    if (!rootRole) return res.status(404).send("Role 'root' not found");

    const rootMembers = rootRole.members
      .filter(member => !member.user.bot)
      .map(member => ({
        id: member.id,
        username: member.user.username,
        tag: member.user.tag,
        avatar: member.user.displayAvatarURL({ format: "webp", size: 128 }),
        presence: member.presence?.status || 'offline',
        description: "Root Admin of the Server"
      }));

    // Render EJS secara manual
    const rawHtml = await res.render("views/team.ejs", { bot: client, req, res, rootMembers });

    // Obfuscate jika kamu punya fungsi seperti ini
    const obfuscatedHTML = obfuscateInlineScripts(rawHtml); // jika tidak, pakai rawHtml saja

    // Minify HTML
    const minifiedHtml = minify(obfuscatedHTML, {
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      ignoreCustomFragments: [/<%[\s\S]*?%>/] // jaga kalau masih ada EJS tag (meski seharusnya sudah tidak ada)
    });

    res.send(minifiedHtml);
  } catch (err) {
    console.error("Error in /team route:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/store', (req, res) => {
    res.render('store/store', { bot: client, req, res }, (err, html) => {
      if (err) return res.status(500).send(err.message);

      const obfuscatedHTML = obfuscateInlineScripts(html);
  
      const minifiedHtml = minify(obfuscatedHTML, {
        collapseWhitespace: true,
        removeComments: true,
        //minifyJS: true,
        minifyCSS: true,
        ignoreCustomFragments: [/<%[\s\S]*?%>/]  // agar tag EJS tidak rusak
      });
  
      res.send(minifiedHtml);
    });
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
}