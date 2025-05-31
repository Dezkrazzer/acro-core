module.exports = function startServer(client) {
const Discord = require("discord.js");
const express = require("express");
const app = express()
//const client = require("./index.js");
client.logger = require("./Utils/logger.js");
const cases = require("./database/Schema/Case")
const StarsPoint = require("./database/Schema/starsPoint"); // Import schema StarsPoint
const ServerHosting = require("./database/Schema/serverHosting");

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


app.get("/auth/logout", checkLogout, (req, res) => {
  const webhook = new Discord.WebhookClient({
    id: "1378316907291344917",
    token: "IaH5bgKmxW6H5wpTgy05U_cD2b0Ac-cL9VS8Q92CSyWP10x7imbQXwlwJwUDycdZVmtM"
  });
  let embedLogout = new Discord.EmbedBuilder()
    .setAuthor({
      name: `${req.user.username}#${req.user.discriminator} logged out`,
      iconURL: `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}`
    })
    .setTimestamp()
    .setColor("#FF0000");
  webhook.send({ embeds: [embedLogout] });

  req.session.destroy();
  res.redirect("/");
});
app.get(
  "/auth/login",
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
      .setAuthor({
        name: `${req.user.username}#${req.user.discriminator} logged in`,
        iconURL: `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}`
      })
      .setTimestamp()
      .setColor("#26fa17");

    webhook.send({ embeds: [embedLogin] });
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

app.get("/dashboard/store", async (req, res) => {
    try {
      // Ambil data untuk dashboard
      const totalProducts = await StarsPoint.countDocuments() + await ServerHosting.countDocuments(); // Contoh, sesuaikan
      const totalPurchases = 500; // Contoh statis, sesuaikan dengan data aktual
      const newCustomers = 75; // Contoh statis, sesuaikan dengan data aktual
      const totalRevenue = "Rp 10.000.000"; // Contoh statis, sesuaikan dengan data aktual

      // Ambil data produk Stars Point dan Server Hosting
      const starsPoints = await StarsPoint.find({});
      const serverHostings = await ServerHosting.find({});

      res.render(
        "store/dashboard",
        {
          bot: client,
          req,
          res,
          totalProducts,
          totalPurchases,
          newCustomers,
          totalRevenue,
          starsPoints,
          serverHostings,
        },
        (err, html) => {
          if (err) return res.status(500).send(err.message);

          const obfuscatedHTML = obfuscateInlineScripts(html);
          const minifiedHtml = minify(obfuscatedHTML, {
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true,
            ignoreCustomFragments: [/<%[\s\S]*?%>/], // agar tag EJS tidak rusak
          });
          res.send(minifiedHtml);
        }
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).send("Internal Server Error");
    }
  });

 app.get("/api/stars-points", async (req, res) => {
    try {
      const data = await StarsPoint.find({});
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while retrieving Stars Point data" });
    }
  });

  app.post("/api/stars-points", async (req, res) => {
    try {
      const { productID, starsAmount, starsBonus, price } = req.body;
      const newStarsPoint = new StarsPoint({ productID, starsAmount, starsBonus, price });
      await newStarsPoint.save();
      res.status(201).json({ message: "Stars Point added successfully!", product: newStarsPoint });
    } catch (error) {
      console.error("Error adding Stars Point:", error);
      res.status(500).json({ error: "An error occurred while adding Stars Point" });
    }
  });

  app.get("/api/stars-points/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const starsPoint = await StarsPoint.findById(id);
        if (!starsPoint) {
            return res.status(404).json({ error: "Stars Point not found." }); // Pastikan ini mengembalikan JSON
        }
        res.json(starsPoint);
    } catch (error) {
        console.error("Error fetching Stars Point:", error);
        // Penting: Pastikan ini juga mengembalikan JSON, bukan HTML
        res.status(500).json({ error: "An error occurred while fetching Stars Point.", details: error.message });
    }
});

  app.put("/api/stars-points/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { productID, starsAmount, starsBonus, price } = req.body;

        // Pastikan Anda menambahkan { runValidators: true } di findByIdAndUpdate
        const updatedStarsPoint = await StarsPoint.findByIdAndUpdate(
            id,
            { productID, starsAmount, starsBonus, price },
            { new: true, runValidators: true } // Sangat Penting ini!
        );

        if (!updatedStarsPoint) {
            return res.status(404).json({ error: "Stars Point not found" });
        }
        res.json({ message: "Stars Point updated successfully!", product: updatedStarsPoint });
    } catch (error) {
        console.error("Error updating Stars Point:", error);
        // Penanganan error Mongoose validation
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map(key => error.errors[key].message);
            return res.status(400).json({ error: "Validation failed", details: errors });
        }
        // Penanganan error cast (misal ID tidak valid)
        if (error.name === 'CastError') {
            return res.status(400).json({ error: "Invalid ID format or data type.", details: error.message });
        }
        // Error umum lainnya
        res.status(500).json({ error: "An error occurred while updating Stars Point", details: error.message });
    }
});

  app.delete("/api/stars-points/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deletedStarsPoint = await StarsPoint.findByIdAndDelete(id);
      if (!deletedStarsPoint) {
        return res.status(404).json({ error: "Stars Point not found" });
      }
      res.json({ message: "Stars Point deleted successfully!" });
    } catch (error) {
      console.error("Error deleting Stars Point:", error);
      res.status(500).json({ error: "An error occurred while deleting Stars Point" });
    }
  });

  // API untuk Server Hosting
  app.get("/api/server-hosting", async (req, res) => {
    try {
      const data = await ServerHosting.find({});
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while retrieving Server Hosting data" });
    }
  });

  app.post("/api/server-hosting", async (req, res) => {
    try {
      const { productID, productName, location, amountRAM, amountCPU, amountStorage, price } = req.body;
      const newServerHosting = new ServerHosting({ productID, productName, location, amountRAM, amountCPU, amountStorage, price });
      await newServerHosting.save();
      res.status(201).json({ message: "Server Hosting added successfully!", product: newServerHosting });
    } catch (error) {
      console.error("Error adding Server Hosting:", error);
      res.status(500).json({ error: "An error occurred while adding Server Hosting" });
    }
  });

  app.put("/api/server-hosting/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { productID, productName, location, amountRAM, amountCPU, amountStorage, price } = req.body;
      const updatedServerHosting = await ServerHosting.findByIdAndUpdate(
        id,
        { productID, productName, location, amountRAM, amountCPU, amountStorage, price },
        { new: true }
      );
      if (!updatedServerHosting) {
        return res.status(404).json({ error: "Server Hosting not found" });
      }
      res.json({ message: "Server Hosting updated successfully!", product: updatedServerHosting });
    } catch (error) {
      console.error("Error updating Server Hosting:", error);
      res.status(500).json({ error: "An error occurred while updating Server Hosting" });
    }
  });

  app.delete("/api/server-hosting/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deletedServerHosting = await ServerHosting.findByIdAndDelete(id);
      if (!deletedServerHosting) {
        return res.status(404).json({ error: "Server Hosting not found" });
      }
      res.json({ message: "Server Hosting deleted successfully!" });
    } catch (error) {
      console.error("Error deleting Server Hosting:", error);
      res.status(500).json({ error: "An error occurred while deleting Server Hosting" });
    }
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