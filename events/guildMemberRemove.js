const Discord = require("discord.js");

module.exports = {
  name: "guildMemberRemove",
  async execute(member, client) {
    const ch = client.channels.cache.get("954177761868664863");
    const leaved = [
      `**${member.user.tag}** just left our server 😔`,
      `We are sad to see you leave the server **${member.user.tag}** 😭`,
      `Goodbye **${member.user.tag}**, please come back 😊`,
      `**${member.user.tag}** has left our server 🛫`,
      `**${member.user.tag}** just left 👋`,
      `**${member.user.tag}** has left this server 🤧`,
    ];
    let random = Math.floor(Math.random() * leaved.length);

    const logsEmbed = new Discord.EmbedBuilder()
      .setTitle(`[\`${member.guild.memberCount}\`] Member left.`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 4096 }))
      .setColor(Discord.Colors.Red)
      .setDescription(`• Username :: ${member.user.globalName} | ${member.user.username}\n• ID :: ${member.user.id}\n• Created At :: ${new Date(member.user.createdTimestamp).toString()}`)
      .setFooter({
        text: `Member left`,
        iconURL: `https://cdn.discordapp.com/emojis/574840995246768149.png?v=1`,
      })
      .setTimestamp();

    const embed = new Discord.EmbedBuilder()
      .setColor("#FF0000")
      .setDescription(`<a:Leave:593588489342156810> | ${leaved[random]}`);

    client.channels.cache.get("954176559332327494").send({ embeds: [logsEmbed] });
    client.channels.cache.get("954173179042091031").send({ embeds: [embed] });
    ch.setName(`Total Member : ${member.guild.memberCount}`);
  },
};