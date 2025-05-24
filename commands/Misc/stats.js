const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const cpuStat = require("cpu-stat");
const momentTz = require("moment-timezone");
const os = require("node:os");
require("moment-duration-format");
const moment = require("moment");

module.exports = {
  name: "stats",
  aliases: ["st"],
  description: "Get bot's real time ping status",
  category: "Misc",

  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Get bot's real time statistics"),

  run: async (client, message, args) => {
    generateStatsEmbed(client, message).then(embed => {
      message.channel.send({ embeds: [embed] });
    });
  },

  execute: async (interaction, client) => {
    generateStatsEmbed(client, interaction).then(embed => {
      interaction.reply({ embeds: [embed] });
    });
  },
};

function convertMS(ms) {
  let d, h, m, s;
  s = Math.floor(ms / 1000);
  m = Math.floor(s / 60);
  s = s % 60;
  h = Math.floor(m / 60);
  m = m % 60;
  d = Math.floor(h / 24);
  h = h % 24;
  return { d, h, m, s };
}

async function generateStatsEmbed(client, interactionOrMessage) {
  return new Promise((resolve) => {
    cpuStat.usagePercent((err, percent) => {
      if (err) {
        console.error(err);
        return resolve(null);
      }

      const uptime = convertMS(client.uptime);
      const osUptime = convertMS(os.uptime() * 1000);
      const latency = Date.now() - interactionOrMessage.createdTimestamp;

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.user.tag} Information`,
          iconURL: client.user.avatarURL(),
        })
        .setColor(client.config?.color || 0x00ae86)
        .addFields(
          {
            name: ":earth_asia: Count:",
            value: `\`\`\`asciidoc\n• Server :: ${client.guilds.cache.size}\n• Channels :: ${client.channels.cache.size.toLocaleString()}\n• Users :: ${client.users.cache.size.toLocaleString()}\n\`\`\``,
          },
          {
            name: "<:nodejs:570073411695673345> System:",
            value: `\`\`\`asciidoc\n• Langs :: Node.js ${process.version}\n• Libs :: Discord.js v${require("discord.js").version}\n\`\`\``,
          },
          {
            name: ":floppy_disk: Usage:",
            value: `\`\`\`asciidoc\n• CPU :: ${percent.toFixed(2)}%\n• Memory :: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB\n• Bot ready at :: ${momentTz.tz(client.readyAt, "Asia/Jakarta").format("ddd MMM Do YYYY HH:mm:ss")} GMT+0700\n (Western Indonesia Time)\n• Bot Uptime :: Booted up ${uptime.d}d ${uptime.h}h ${uptime.m}m ${uptime.s}s\n• OS Uptime :: Booted up ${osUptime.d}d ${osUptime.h}h ${osUptime.m}m ${osUptime.s}s\n\`\`\``,
          },
          {
            name: "<:CPU:569348415264129057> CPU:",
            value: `\`\`\`md\n${os.cpus().length}x ${os.cpus()[0].model}\n\`\`\``,
          },
          {
            name: ":bar_chart: Other:",
            value: `\`\`\`asciidoc\n• Arch :: ${os.arch()}\n• Platform :: ${os.platform()}\n• Latency :: ${latency.toLocaleString()} ms\n• Websockets ping :: ${client.ws.ping.toLocaleString()} ms\n\`\`\``,
          }
        )
        .setTimestamp()
        .setFooter({
          text: `Replying to ${
            interactionOrMessage.user
              ? interactionOrMessage.user.tag
              : interactionOrMessage.author.tag
          }`,
          iconURL: interactionOrMessage.user
            ? interactionOrMessage.user.avatarURL()
            : interactionOrMessage.author.avatarURL(),
        });

      resolve(embed);
    });
  });
}
