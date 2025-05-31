// server.js
const Discord = require("discord.js");
const express = require("express");
const app = express();
// const client = require("./index.js"); // Ini tidak diperlukan karena client sudah diteruskan
const { json, urlencoded } = require("body-parser");
const { resolve } = require("path");
const { minify } = require('html-minifier');
const JavaScriptObfuscator = require('javascript-obfuscator');
const passport = require("passport"); // Pastikan ini diimpor
const session = require('express-session'); // Pastikan ini diimpor
const { Strategy } = require("passport-discord"); // Pastikan ini diimpor

// Import model-model Anda
const ServerHosting = require('./database/Schema/serverHosting.js'); // Sesuaikan path jika berbeda
const StarsPoint = require('./database/Schema/starsPoint.js');     // Sesuaikan path jika berbeda

// Impor controller admin Anda, dan berikan model Mongoose yang sudah terhubung
const adminController = require('./controller/storeController.js')(ServerHosting, StarsPoint);

module.exports = function startServer(client) {
    client.logger = require("./Utils/logger.js"); // Pastikan logger diakses dari client
    // const cases = require("./database/Schema/Case") // Sudah diinisialisasi di index.js atau bisa diakses via client.mongo

    const scopes = ["identify", "guilds", "guilds.join"];
    const checkAuth = (req, res, next) => {
        if (req.isAuthenticated()) return next();
        else res.redirect("/auth/login");
    };
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

    // --- Rute Express dari aplikasi Discord bot Anda (sudah ada) ---
    app.get('/', (req, res) => {
        res.render('index', { bot: client, req, res }, (err, html) => {
            if (err) return res.status(500).send(err.message);
            const obfuscatedHTML = obfuscateInlineScripts(html);
            const minifiedHtml = minify(obfuscatedHTML, {
                collapseWhitespace: true, removeComments: true, minifyCSS: true,
                ignoreCustomFragments: [/<%[\s\S]*?%>/]
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

            const adminRole = guild.roles.cache.get("954173497222004836");
            if (!adminRole) return res.status(404).send("Role 'Administrator' not found");

            const modRole = guild.roles.cache.get("1152209810889129984");
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
                    globalName: member.user.globalName, // Duplikat, perbaiki jika perlu
                    username: member.user.username,
                    avatar: member.user.displayAvatarURL({ format: "webp", size: 128 }),
                    presence: member.presence?.status || 'offline'
                }));

            req.app.render("team", { bot: client, req, res, rootMembers, adminMembers, modMembers }, (err, html) => {
                if (err) {
                    console.error("Render error:", err);
                    return res.status(500).send("Render Error");
                }
                const obfuscatedHTML = obfuscateInlineScripts(html);
                const minifiedHtml = minify(obfuscatedHTML, {
                    collapseWhitespace: true, removeComments: true, minifyCSS: true, ignoreCustomFragments: [/<%[\s\S]*?%>/]
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
                collapseWhitespace: true, removeComments: true, minifyCSS: true, ignoreCustomFragments: [/<%[\s\S]*?%>/]
            });
            res.send(minifiedHtml);
        });
    });

    // --- Rute Admin Dashboard Anda ---
    app.get('/dashboard/store', adminController.getDashboard);
    app.get('/dashboard/products', adminController.getProductsPage);
    app.get('/dashboard/products/edit/:type/:id', adminController.getEditProductPage);
    app.post('/dashboard/products/add', adminController.addProduct);
    app.post('/dashboard/products/edit/:type/:id', adminController.updateProduct);
    app.post('/dashboard/products/delete/:type/:id', adminController.deleteProduct);

    // --- Rute API Anda (tetap di sini) ---
    app.get("/api/case", async (req, res) => {
        try {
            const data = await cases.find({}); // Gunakan model Cases yang diimpor
            res.json(data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "An error occurred while retrieving data" });
        }
    });

    app.listen("1039", () => {
        client.logger.log("> ✅ • You app is listening on port 1039", "success");
    });
};