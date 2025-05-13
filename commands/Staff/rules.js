const Discord = require("discord.js")

module.exports = {
    name: "rules",
    aliases: [],
    description: "Send the rules text on about-server",
    category: "Owner",
    run: async (client, message, args) => {

        if (message.author.id !== client.config.ownerID) return message.channel.send({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription("<a:no:954773357407113298> | I'm sorry but you don't have permission to do that.")
                    .setColor(Discord.Colors.Red)
            ]
        });

        let guildIcon = message.guild.iconURL({ dynamic: true, size: 4096})

        let AboutEmbed = new Discord.EmbedBuilder()
        .setColor(client.config.color)
        .setAuthor({
            name: `About Server - ${message.guild.name}`,
            iconURL: guildIcon
        })
        .setDescription("```Selamat datang di Acro Network – tempat di mana imajinasi menjadi kenyataan! Bergabunglah dengan kami dan temukan dunia yang penuh petualangan, keajaiban, dan komunitas yang menyenangkan. Jangan lewatkan kesempatan untuk menjadi bagian dari pengalaman yang tak terlupakan!```\n")
        .addFields(
            { name: "IP Address", value: client.config.serverIP, inline: true },
            { name: "Port", value: "1025 (For Bedrock)", inline: true },
            { name: "Client", value: "Supported Minecraft Java & Bedrock (Crossplay)" },
            { name: "Version", value: "Supported 1.18.x - 1.21.x" }
        )

        let RulesEmbed = new Discord.EmbedBuilder()
        .setColor(client.config.color)
        .setAuthor({
            name: `Rules Server - ${message.guild.name}`,
            iconURL: guildIcon
        })
        .setDescription(`
            ▪ No spamming, flooding, or self-promotion
            ▪ Don't share NSFW content on random channels
            ▪ Don't direct message anyone unless you already know them personally
            ▪ Abusing is allowed but stay in your limits
            ▪ Last but not the least, be respectful of others! This includes but not limited to, refrain from being toxic, using hate speech, racism and sexual harassment

            > Use the \`/rules\` command on the server for gameplay (ingame) rules\n
                \`\`\`Simple rules, but every staff is different, staff can take any action and whenever they want\`\`\`
            `)
            .addFields(
                { name: "Note:", value: "Keep in mind that our servers have smart AI designed to protect our servers. Our AI works without sleep (he is not human), automod works non-stop every day (unless there are some things)" },
                { name: "Invite Link:", value: "https://dsc.gg/acronetwork" }
            )

        let RolesEmbed = new Discord.EmbedBuilder()
        .setColor(client.config.color)
        .setAuthor({
            name: `Roles Server - ${message.guild.name}`,
            iconURL: guildIcon
        })
        .setDescription(`Take the role below by clicking the reaction below. **DO NOT SPAM CLICK**. If you are caught playing click spam, you will be given a <@&956904276335144970> role`)
        .addFields(
            { name: "🔔 - Server Update Ping", value: "> You will get a notification when there is any update in the server, including Minecraft Server patch updates." },
            { name: "💵 - Free Games Ping", value: "> You will get a mention if there are free games on a platform. Apart from being free, there are also discount game notifications" },
            { name: "🎮 - Game Update Ping", value: "> You will get a mention if there is a game update or new patch. You can request the game you want to add" },
            { name: "▶️ - Youtube Ping", value: "> You will get a mention if there is a video or live video from YouTube. You can request the channel you want to add" },
            { name: "🏆 - MPL ID Ping", value: "> You will get a mention if there is an MPL ID match schedule for that day or information if you want to watch it together" }
        )

        let LinkEmbed = new Discord.EmbedBuilder()
        .setColor(client.config.color)
        .setAuthor({
            name: `Link Server - ${message.guild.name}`,
            iconURL: guildIcon
        })
        .setDescription(`Here are links to available servers`)
        .addFields(
            { name: "Discord Server", value: "https://dsc.gg/acronetwork" },
            { name: "Website", value: "https://acronet.work" },
            { name: "Status Page", value: "https://status.acronetwork.my.id" },
            { name: "Minecraft Vote", value: "▪ https://minecraft-mp.com/server/335686/vote/ (primary)\n▪ https://topminecraftservers.org/vote/38697\n▪ https://minecraftpocket-servers.com/server/129241/vote/" },
            { name: "Donate", value: "https://sociabuzz.com/acronetwork/tribe" },
            { name: "Social Media", value: "YouTube | TikTok | Instagram" }
        )

        if (!args[0]) {
            message.channel.send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription("<a:no:954773357407113298> | Please select one Please select one of \`all\`, \`about\`, \`rules\`, \`roles\`, \`link\`")
                        .setColor(Discord.Colors.Red)
                ]
            });
          } else if (args[0] == "all") {
            client.channels.cache.get("954175101371301960").send({ embeds: [AboutEmbed] })
            client.channels.cache.get("954175101371301960").send({ embeds: [RulesEmbed] })
            client.channels.cache.get("954175101371301960").send({ embeds: [RolesEmbed] })
            client.channels.cache.get("954175101371301960").send({ embeds: [LinkEmbed] })
          } else if (args[0] == "about") {
            client.channels.cache.get("954175101371301960").send({ embeds: [AboutEmbed] })
          } else if (args[0] == "rules") {
            client.channels.cache.get("954175101371301960").send({ embeds: [RulesEmbedEmbed] })
          } else if (args[0] == "roles") {
            client.channels.cache.get("954175101371301960").send({ embeds: [RolesEmbed] })
          } else if (args[0] == "link") {
            client.channels.cache.get("954175101371301960").send({ embeds: [LinkEmbed] })
          }
    }
}