const discord = require("discord.js");
const config = require("./config.json");
const { KeyMongo } = require("key-mongo");
const mongoose = require("mongoose");
require('./server.js');

// ===== ANTI-BADLINK FEATURE ===== //

const isMute = require("./database/Schema/isMute")
const Case = require("./database/Schema/Case")

const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, 'antilink.txt');
let bannedUrls = [];

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
      console.error('Error reading dangurls.txt:', err);
      return;
  }
  bannedUrls = data.split(/\r?\n/).filter(url => url.trim() !== '');
  console.log('Banned URLs loaded:', bannedUrls);
});

function containsBannedUrl(messageContent) {
    const normalizedMessage = messageContent.toLowerCase();
  
    for (const bannedUrl of bannedUrls) {
        const normalizedBannedUrl = bannedUrl.toLowerCase();
        
        if (normalizedMessage.includes(normalizedBannedUrl)) {
            return true; 
        }
    }
    return false; 
  }

// ===== END OF ANTI-BADLINK FEATURE ===== //

const client = new discord.Client({
    closeTimeout: 3_000 ,
    waitGuildTimeout: 15_000,
    intents: [discord.GatewayIntentBits.Guilds, discord.GatewayIntentBits.GuildMessages, discord.GatewayIntentBits.GuildMembers, discord.GatewayIntentBits.MessageContent],
    allowedMentions: {
        parse: ["users"],
        repliedUser: true
    },
    sweepers: {
		...discord.Options.DefaultSweeperSettings,
		messages: {
			interval: 3600, // Every hour...
			lifetime: 1800,	// Remove messages older than 30 minutes.
		},
	},
});

client.commands = new discord.Collection();
client.aliases = new discord.Collection();
client.config = config;
client.logger = require('./Utils/logger');
client.mongo = new KeyMongo({
    dbName: "data",
    dbUrl:
      "mongodb+srv://athx:athx123@coredata.xyliwmo.mongodb.net/?retryWrites=true&w=majority",
    collectionName: "core"
  });
client.cases = Math.random(1000).toString(36).substr(2, 8);
client.logsChannel = "954396398617501726"; 


mongoose.connect('mongodb+srv://athx:athx123@coredata.xyliwmo.mongodb.net/?retryWrites=true&w=majority', {
  serverSelectionTimeoutMS: 5000,
}).then(() => {
    client.logger.log(`> ✅ • Database server connected to MongoDB`, "success");
}).catch((err) => {
    client.logger.log(`> ❌ • Database server connected to MongoDB`, "error");
});
mongoose.connection.on('error', err => {
  console.error(`Mongoose connection error: ${err}`);
});


["commands", "events"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

client.on('error', error => client.logger.log(error.stack, "error"));
client.on('warn', info => client.logger.log(info, "warn"));
process.on('unhandledRejection', error => client.logger.log("UNHANDLED_REJECTION\n" + error.stack, "error"));
process.on('uncaughtException', error => {
    client.logger.log("UNCAUGHT_EXCEPTION\n" + error.stack, "error");
    client.logger.log("Uncaught Exception is detected, restarting...", "info");
    process.exit(1);
});

// ===== ANTI-BADLINK EVENT ====== //

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content) return;

    if (containsBannedUrl(message.content)) {
        try {
            await message.delete();

            const linkEmbed = new discord.EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                  name: `Suspicious link detected`,
                  iconURL: `https://cdn.discordapp.com/emojis/590433107111313410.gif`,
                })
                .setDescription("The link sent may be a malicious link. I will try to prevent, don't try to open it")
            

            const author = client.user.tag;
            const reason = '[AUTO] Post suspicious links';
            const member = message.author;

            const logsEmbed = new discord.EmbedBuilder()
            .setColor(discord.Colors.Red)
            .setAuthor({ name: `Auto-Muted | Case ${client.cases}`, iconURL: 'https://cdn.discordapp.com/emojis/742191092652310578.png?v=1' })
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 4096 }))
            .addFields(
                    { name: 'Muted User', value: `${member} | \`${member.id}\`` },
                    { name: 'Moderator', value: `${author}` },
                    { name: 'Reason', value: `\`\`\`\n${reason}\n\`\`\`` },
                    { name: 'Timestamp', value: `**\`\`\`css\n${new Date(message.createdTimestamp).toString()}\n\`\`\`**` }
            )
            .setTimestamp();

            const userEmbed = new discord.EmbedBuilder()
            .setAuthor({ name: `${message.guild.name} Auto-Muted | Case ${client.cases}`, iconURL: message.guild.iconURL() })
            .setColor('#2f3136')
            .setDescription(`You have been auto-muted on **${message.guild.name}**`)
            .addFields(
                { name: 'Reason', value: `\`\`\`${reason}\`\`\`` },
                { name: 'Moderator', value: `${author}` }
            )
            .setFooter({ text: 'If this is a mistake, please DM our staff.' })
            .setTimestamp();

            const alertEmbed = new discord.EmbedBuilder()
            .setColor("#2f3136")
            .setAuthor({
              name: `Suspicious link deleted`,
              iconURL: `https://cdn.discordapp.com/emojis/590433485202915328.gif`,
            })
            .setDescription([
              `> Message ID: \`${message.id}\``,
              `> Channel: ${message.channel.toString()}`, // Memastikan ini string
              `> Author: ${member.tag} | \`${member.id}\``,
            ].join('\n'))
            .addFields({ name: '> Content:', value: `|| ${message.content} ||` })
            .setFooter({ text: `Don't try to open it` })
            .setTimestamp();


            await message.member.roles.add('954378331401367572');
            await message.channel.send({ content: `<@${message.author.id}>`, embeds: [linkEmbed] });

            const logChannel = client.channels.cache.get(client.logsChannel);
            if (logChannel) {
              await logChannel.send({ embeds: [logsEmbed] });
            }
            const alertChannel = client.channels.cache.get("954176625887571998");
            if (alertChannel) {
              await alertChannel.send({ embeds: [alertEmbed] });
            }
            await client.users.cache.get(member.id).send({ embeds: [userEmbed] });

            await isMute.create({
              userID: member.id,
              isMuted: true
            });
            await Case.create({
              caseID: client.cases,
              userID: member.id,
              globalName: member.globalName,
              modType: "Auto-Mute",
              moderator: author,
              reason: reason
            });

            client.logger.log(`> ℹ️ • I prevent malicious links from ${message.author.tag}`, "success")
        } catch (err) {
            client.logger.log("> ❌ • Failed to prevent malicious link:\n" + err.stack, "error");
        }
    }
})

// ===== END OF ANTI-BADLINK EVENT ===== //

client.login(config.token).catch(() => { client.logger.log('Invaid TOKEN!', "warn") });