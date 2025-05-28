const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "avatar",
    aliases: ["av", "ava", "pp"],
    description: "View other people's profile photos in HD quality",
    category: "Misc",
    
    // Prefix-based command
    run: async (client, message, args) => {
        const nameQuery = args.join(" ").toLowerCase();

        // Step 1: Try cache
        let member =
            message.mentions.members.first() ||
            message.guild.members.cache.get(args[0]) ||
            message.guild.members.cache.find(m => m.user.username.toLowerCase().includes(nameQuery)) ||
            message.member;

        // Step 2: Fetch all if not found
        if (!member && nameQuery) {
            try {
                const fetched = await message.guild.members.fetch();
                member = fetched.find(m => m.user.username.toLowerCase().includes(nameQuery));
            } catch (err) {
                return message.channel.send("❌ Gagal mengambil data anggota dari server.");
            }
        }

        // Fallback to message author
        if (!member) member = message.member;

        const user = member.user;
        const image = user.avatarURL({ dynamic: true, size: 4096 });

        const embed = new EmbedBuilder()
            .setColor("#2f3136")
            .setAuthor({
                name: `${user.username}#${user.discriminator} Avatar`,
                iconURL: image,
                url: image
            })
            .setImage(image)
            .setFooter({ text: `Requested by ${message.author.username}` })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },

    // Slash Command version
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("View someone's avatar in HD")
        .addUserOption(option =>
            option.setName("target")
                .setDescription("Select a user")
                .setRequired(false)
        ),

    // Slash handler
    runInteraction: async (client, interaction) => {
        const user = interaction.options.getUser("target") || interaction.user;
        const image = user.avatarURL({ dynamic: true, size: 4096 });

        const embed = new EmbedBuilder()
            .setColor("#2f3136")
            .setAuthor({
                name: `${user.username}#${user.discriminator} Avatar`,
                iconURL: image,
                url: image
            })
            .setImage(image)
            .setFooter({ text: `Requested by ${interaction.user.username}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
