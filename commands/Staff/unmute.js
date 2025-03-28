const Discord = require("discord.js")
const isMute = require("../../database/Schema/isMute")
const Case = require("../../database/Schema/Case")

module.exports = {
    name: "unmute",
    aliases: [],
    description: "Unmute a member",
    category: "Staff",
    run: async (client, message, args) => {
        if(!message.member.permissions.has(Discord.PermissionsBitField.Flags.MuteMembers) && !message.member.roles.cache.some((r) => r.name === "Moderator")) {
            return message.channel.send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription("<a:no:954773357407113298> | I'm sorry but you don't have permission to do that.")
                        .setColor(Discord.Colors.Red)
                ]
            });
        }

        let user = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!user) return message.channel.send({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription("<a:no:954773357407113298> | You need to specify a user to mute.")
                    .setColor(Discord.Colors.Red)
            ]
        });

        let muted = await isMute.findOne({ userID: user.id });
        if (!muted) return message.channel.send({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`<a:no:954773357407113298> | Sorry, but <@${user.id}> is not muted.`)
                    .setColor(Discord.Colors.Red)
            ]
        });

        let muteRole = message.guild.roles.cache.find(r => r.name === "Muted")
        let reason = args.slice(1).join(" ")
        if (!reason) reason = "No reason specified."


        let logsEmbed = new Discord.EmbedBuilder()
        .setColor(Discord.Colors.Green)
        .setAuthor({
            name: `Unmuted User`,
            iconURL: `https://cdn.discordapp.com/emojis/742191092069433425.png`,
          })
        .setThumbnail(`${message.author.displayAvatarURL({ dynamic: true, size: 4096 })}`)
        .addFields(
            { name: "**Unmuted User**", value: `${user} | \`${user.id}\`` },
            { name: "**Moderator**", value: `${message.author} | \`${message.author.id}\`` },
            { name: "**Reason**", value: `\`\`\`\n${reason}\n\`\`\`` },
            { name: "**Timestamp**", value: `**\`\`\`css\n${new Date(message.createdTimestamp).toString()}\n\`\`\`**` }
          )
        .setTimestamp();

        let userEmbed = new Discord.EmbedBuilder()
        .setAuthor({ 
            name: `${message.guild.name} Unmuted`, 
            iconURL: message.guild.iconURL() 
        })
        .setColor("#2f3136")
        .setDescription(`You has been unmuted on **${message.guild.name}**`)
        .addFields(
            { name: "Reason", value: `\`\`\`${reason}\`\`\`` },
            { name: "Moderator", value: `${message.author} | \`${message.author.id}\`` }
        )
        .setFooter({ text: "If this is a mistake, please DM our staff" })
        .setTimestamp();

        await isMute.deleteOne({ userID: user.id });
        user.roles.remove(muteRole)
        user.send({ embeds: [userEmbed] })
        client.channels.cache.get(client.logsChannel).send({ embeds: [logsEmbed] })
        message.channel.send({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(`<a:yes:954773528153059350> | <@${user.id}> has been unmuted.`)
                    .setColor(Discord.Colors.Green)
            ]
        });

        




    }
}