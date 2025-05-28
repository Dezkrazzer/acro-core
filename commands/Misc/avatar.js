const Discord = require("discord.js")

module.exports = {
    name: "avatar",
    aliases: ["av", "ava", "pp"],
    description: "View other people's profile photos in HD quality",
    category: "Misc",
    run: async (client, message, args) => {
        const nameQuery = args.join(" ").toLowerCase();
        let member =
            message.mentions.members.first() ||
            message.guild.members.cache.get(args[0]) ||
            message.guild.members.cache.find(m => m.user.username.toLowerCase().includes(nameQuery)) ||
            message.member;
        let image = member.user.avatarURL({ dynamic: true, size: 4096 });

        let EmbedAvatar = new Discord.EmbedBuilder()
            .setColor("#2f3136")
            .setAuthor({
                name: `${user.username}#${user.discriminator} Avatar`,
                iconURL: image,
                url: `https://media.discordapp.net/attachments/575097325945618432/956523208717238282/903868915581616189.png`
            })
            .setImage(image)
            .setFooter({
                text: `Requested by ${message.author.globalName}`
            })
            .setTimestamp();

        message.channel.send({ embeds: [EmbedAvatar]} )
    }
}