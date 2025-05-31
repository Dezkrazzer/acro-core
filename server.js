module.exports = function startServer(client) {
const Discord = require("discord.js");
const express = require("express");
const app = express()
//const client = require("./index.js");
client.logger = require("./Utils/logger.js");
const cases = require("./database/Schema/Case")
const { json, urlencoded } = require("body-parser")
const { resolve } = require("path")
const { minify } = require('html-minifier')
const JavaScriptObfuscator = require('javascript-obfuscator')

const session = require('express-session')
const { Strategy } = require("passport-discord")
const passport = require("passport")
const scopes = ["identify", "guilds", "guilds.join"]
const checkAuth = (req, res, next) => {
        if (req.isAuthenticated()) return next();
        else res.redirect("/auth/login");
      }
const checkLogout = (req, res, next) => {
        if (req.isAuthenticated()) return next();
        else res.redirect("/auth/logout");
      };

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(
  new Strategy(
    {
      clientID: "942383674358366258",
      clientSecret: "MOhT19cn2Ork5-qd8LEx2aOJjLFRYMSP",
      callbackURL: "https://acronet.work/auth/callback",
      scope: scopes
    },
    function(accessToken, refreshToken, profile, done) {
      process.nextTick(function() {
        return done(null, profile);
      });
    }
  )
);

app.use(
  session({
    secret: "acro-network-secret-key",
    resave: true,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());

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

app.get("/auth/login", checkAuth);
app.get("/auth/logout", checkLogout, (req, res) => {
  const webhook = new Discord.WebhookClient({
    id: "1378316907291344917",
    token: "IaH5bgKmxW6H5wpTgy05U_cD2b0Ac-cL9VS8Q92CSyWP10x7imbQXwlwJwUDycdZVmtM"
  });
  let embedLogout = new Discord.EmbedBuilder()
    .setAuthor(
      `${req.user.username}#${req.user.discriminator} logout`,
      `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}`
    )
    .setTimestamp()
    .setColor("#FF0000");
  webhook.send(embedLogout);

  req.session.destroy();
  res.redirect("/");
});
app.get(
  "/auth",
  passport.authenticate("discord", { scope: scopes }),
  (req, res) => {}
);
app.get(
  "/auth/callback",
  passport.authenticate("discord", {
    failureRedirect: "/auth/login"
  }),
  (req, res) => {
    console.log(`[#${req.user.id}]: Logged`);
  const webhook = new Discord.WebhookClient({
    id: "1378316907291344917",
    token: "IaH5bgKmxW6H5wpTgy05U_cD2b0Ac-cL9VS8Q92CSyWP10x7imbQXwlwJwUDycdZVmtM"
  });
    let embedLogin = new Discord.EmbedBuilder()
      .setAuthor(
        `${req.user.username}#${req.user.discriminator} logged`,
        `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}`
      )
      .setTimestamp()
      .setColor("#26fa17");

    webhook.send(embedLogin);
    res.redirect("/");
  }
);


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

    await guild.members.fetch();

    const rootRole = guild.roles.cache.find(role => role.name.toLowerCase() === "root");
    if (!rootRole) return res.status(404).send("Role 'root' not found");

    const adminRole = guild.roles.cache.get("954173497222004836")
    if (!adminRole) return res.status(404).send("Role 'Administrator' not found");

    const modRole = guild.roles.cache.get("1152209810889129984")
    if (!modRole) return res.status(404).send("Role 'Moderator' not found");

    const rootMembers = rootRole.members
      .filter(member => !member.user.bot)
      .map(member => ({
        id: member.id,
        globalName: member.user.globalName,
        username: member.user.username,
        avatar: member.user.displayAvatarURL({ format: "webp", size: 128 }),
        presence: member.presence?.status || 'offline'
      }));
    
    const adminMembers = adminRole.members
      .filter(member => !member.user.bot)
      .map(member => ({
        id: member.id,
        globalName: member.user.globalName,
        username: member.user.username,
        avatar: member.user.displayAvatarURL({ format: "webp", size: 128 }),
        presence: member.presence?.status || 'offline'
      }));

    const modMembers = modRole.members
      .filter(member => !member.user.bot)
      .map(member => ({
        id: member.id,
        globalName: member.user.globalName,
        username: member.user.username,
        avatar: member.user.displayAvatarURL({ format: "webp", size: 128 }),
        presence: member.presence?.status || 'offline'
      }));


    req.app.render("team", { bot: client, req, res, rootMembers, adminMembers, modMembers }, (err, html) => {
      if (err) {
        console.error("Render error:", err);
        return res.status(500).send("Render Error");
      }

      // Optional: obfuscate inline <script> jika perlu
      const obfuscatedHTML = obfuscateInlineScripts(html); // atau langsung pakai `html`

      const minifiedHtml = minify(obfuscatedHTML, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        ignoreCustomFragments: [/<%[\s\S]*?%>/]
      });

      return res.send(minifiedHtml);
    });

  } catch (err) {
    console.error("Error in /team route:", err);
    return res.status(500).send("Internal Server Error");
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