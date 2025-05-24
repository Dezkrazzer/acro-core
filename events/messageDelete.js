const Discord = require("discord.js");

module.exports = {
  name: "messageDelete",
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;

    const attachments = message.attachments.size > 0
      ? message.attachments.map(attachment => attachment.proxyURL)
      : null;

    const embed = new Discord.EmbedBuilder()
      .setColor("#2f3136")
      .setAuthor({
        name: `New Message Deleted`,
        iconURL: `https://cdn.discordapp.com/emojis/737554516999929867.gif`,
      })
      .setDescription(`> Message ID: \`${message.id}\`\n> Channel: ${message.channel}\n> Author: <@${message.member.id}> | \`${message.member.id}\``)
      .setTimestamp();

    if (message.content?.length) {
      embed.addFields({
        name: `> Content:`,
        value: `\u200B\n\u200B${message.content}`,
      });
    }
    if (attachments) {
      embed.setImage(attachments[0]);
    }

    const channel = message.guild.channels.cache.find(ch => ch.name === "🚫┇automod");
    if (channel) channel.send({ embeds: [embed] });
  },
};