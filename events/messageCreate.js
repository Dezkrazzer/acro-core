const discord = require("discord.js");
const config = require("../config.json");
const lineReader = require("line-reader");
const nvt = require("node-virustotal");
const isMute = require("./../database/Schema/isMute");
const Case = require("./../database/Schema/Case");

module.exports = async (client, message) => {
  let prefix = client.config.prefix;
  if (
    !message.content.startsWith(prefix) ||
    message.author.bot ||
    message.channel.type === "dm"
  )
    return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmda = args.shift().toLowerCase();
  let command =
    client.commands.get(cmda) ||
    client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(cmda));
  if (!command) return;

  try {
    command.run(client, message, args);
  } catch (error) {
    client.logger.log(error, "error");
    message.reply({
      content: `there was an error trying to execute that command!`,
    });
  } finally {
    client.logger.log(
      `> ID : ${message.author.id} | User : ${message.author.tag} | command | ${command.name}`,
      "info"
    );
  }

  //Anti-link feature
  const { EmbedBuilder } = require("discord.js");
  const lineReader = require("line-reader");
  let j = 0;

  function isValidURL(string) {
    const res = string.match(
      /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
    );
    return res !== null;
  }

  if (isValidURL(message.content.toLowerCase())) {
    const a = message.id;

    lineReader.eachLine("dangurls.txt", (line, last, cb) => {
      if (message.content.toLowerCase().includes(line)) {
        message.channel.messages.fetch(a).then((msg) => {
          msg.delete().catch(console.error);
        });

        const linksEmbed = new Discord.mbedBuilder()
          .setColor("#E7A700")
          .setTitle("⚠ Malicious link detected ⚠")
          .setFooter({
            text: "The link sent may be malicious. Don't try to open it.",
          });

        const author = client.user.tag;
        const reason = "Posted malicious link detected";
        const member = message.author;

        const logsLinkEmbed = new Discord.EmbedBuilder()
          .setColor("RED")
          .setAuthor({
            name: `Auto-Muted | Case ${client.cases}`,
            iconURL:
              "https://cdn.discordapp.com/emojis/742191092652310578.png?v=1",
          })
          .setThumbnail(
            message.author.displayAvatarURL({ dynamic: true, size: 4096 })
          )
          .addFields(
            { name: "Muted User", value: `${member} | \`${member.id}\`` },
            { name: "Moderator", value: `${author}` },
            { name: "Reason", value: `\`\`\`\n${reason}\n\`\`\`` },
            {
              name: "Timestamp",
              value: `**\`\`\`css\n${new Date(
                message.createdTimestamp
              ).toString()}\n\`\`\`**`,
            }
          )
          .setTimestamp();

        const userEmbed = new Discord.EmbedBuilder()
          .setAuthor({
            name: `${message.guild.name} Auto-Muted | Case ${client.cases}`,
            iconURL: message.guild.iconURL(),
          })
          .setColor("#2f3136")
          .setDescription(
            `You have been auto-muted on **${message.guild.name}**`
          )
          .addFields(
            { name: "Reason", value: `\`\`\`${reason}\`\`\`` },
            { name: "Moderator", value: `${author}` }
          )
          .setFooter({ text: "If this is a mistake, please DM our staff." })
          .setTimestamp();

        const alertEmbed = new Discord.EmbedBuilder()
          .setColor("#2f3136")
          .setAuthor({
            name: "Malicious link detected",
            iconURL: "https://cdn.discordapp.com/emojis/590433107111313410.gif",
          })
          .setDescription(
            `> Message ID: \`${message.id}\`\n> Channel: ${message.channel}\n> Author: ${member} | \`${member.id}\``
          )
          .addFields({ name: "Content:", value: `|| ${message.content} ||` })
          .setFooter({ text: "Don't try to open it." })
          .setTimestamp();

        const channel = message.guild.channels.cache.find(
          (ch) => ch.name === "🚫┇discord-automod"
        );
        if (channel) channel.send({ embeds: [alertEmbed] });

        message.member.roles.add("954378331401367572").catch(console.error);
        client.users.cache
          .get(member.id)
          .send({ embeds: [userEmbed] })
          .catch(console.error);
        bot.channels.cache
          .get(client.logsChannel)
          .send({ embeds: [logsLinkEmbed] })
          .catch(console.error);

        isMute.create({
          userID: member.id,
          isMuted: true,
        });
        Case.create({
          caseID: client.cases,
          userID: member.id,
          globalName: member.user.globalName,
          modType: "Auto-Mute",
          moderator: author.id,
          reason: reason,
        });

        message.channel
          .send(`${message.author}`)
          .then(() => {
            message.channel.send({ embeds: [linksEmbed] });
          })
          .catch(() => {
            message.reply("An error occurred.");
          });

        j++;
        cb(false); // Stop reading file
      } else {
        cb(); // Continue reading
      }
    });
  }

  // Continue with Virustotal API and other logic...
};
