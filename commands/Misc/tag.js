const Discord = require("discord.js");
const Tag = require(".../database/Schema/Tag");  // Import model mongoose

module.exports = {
    name: "tag",
    aliases: [],
    description: "Use tags for quick messages",
    category: "Misc",
    run: async (client, message, args) => {
        if (!args[0]) {
            return message.channel.send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription("<a:no:954773357407113298> | Not a valid command. I've `add`, `show`, `list`")
                        .setColor(Discord.Colors.Red)
                ]
            });
        }

        if (args[0] === "add") {
            if (!args[1]) {
                return message.channel.send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setDescription("<a:no:954773357407113298> | You need to specify a name to add a new tag")
                            .setColor(Discord.Colors.Red)
                    ]
                });
            }

            let name = args[1];
            let tag = await Tag.findOne({ name: name });
            let response = args.slice(2).join(" ");

            if (tag) {
                return message.channel.send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setDescription("<a:no:954773357407113298> | This tag name already exists")
                            .setColor(Discord.Colors.Red)
                    ]
                });
            }

            if (!response) {
                return message.channel.send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setDescription("<a:no:954773357407113298> | You need to specify a response")
                            .setColor(Discord.Colors.Red)
                    ]
                });
            }

            await Tag.create({
                author: message.author.id,
                name: name,
                response: response
            });

            return message.channel.send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`<a:yes:954773528153059350> | Tag \`${name}\` has been added.`)
                        .setColor(Discord.Colors.Green)
                ]
            });
        }

        if (args[0] === "delete") {
            if (!args[1]) {
                return message.channel.send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setDescription("<a:no:954773357407113298> | You need to specify a name to delete")
                            .setColor(Discord.Colors.Red)
                    ]
                });
            }

            let name = args[1];
            let tag = await Tag.findOne({ name: name });

            if (!tag) {
                return message.channel.send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setDescription("<a:no:954773357407113298> | This tag doesn't exist")
                            .setColor(Discord.Colors.Red)
                    ]
                });
            }

            await Tag.deleteOne({ name: name });

            return message.channel.send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`<a:yes:954773528153059350> | Tag \`${name}\` has been deleted.`)
                        .setColor(Discord.Colors.Green)
                ]
            });
        }

        if (!args[0]) {
            return message.channel.send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription("<a:no:954773357407113298> | You need to specify a name to show")
                        .setColor(Discord.Colors.Red)
                ]
            });
        }

        let name = args[0];
        let tag = await Tag.findOne({ name: name });

        if (!tag) {
            return message.channel.send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription("<a:no:954773357407113298> | This tag doesn't exist")
                        .setColor(Discord.Colors.Red)
                ]
            });
        }

        message.channel.send(tag.response);
    }
};
