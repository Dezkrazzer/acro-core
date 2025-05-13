const Discord = require("discord.js");
const Tag = require("../../database/Schema/Tag");  // Import model mongoose

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
            if (!message.member.permissions.has(Discord.PermissionsBitField.Flags.ManageMessages)) {
                return message.channel.send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setDescription("<a:no:954773357407113298> | I'm sorry but you don't have permission to do that.")
                            .setColor(Discord.Colors.Red)
                    ]
                });
            }
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
            if (!message.member.permissions.has(Discord.PermissionsBitField.Flags.ManageMessages)) {
                return message.channel.send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setDescription("<a:no:954773357407113298> | I'm sorry but you don't have permission to do that.")
                            .setColor(Discord.Colors.Red)
                    ]
                });
            }
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

        if (args[0] === "edit") {
            if (!message.member.permissions.has(Discord.PermissionsBitField.Flags.ManageMessages)) {
                return message.channel.send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setDescription("<a:no:954773357407113298> | I'm sorry but you don't have permission to do that.")
                            .setColor(Discord.Colors.Red)
                    ]
                });
            }
            if (!args[1]) {
                return message.channel.send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setDescription("<a:no:954773357407113298> | You need to specify a name to edit")
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

            let response = args.slice(2).join(" ");

            if (!response) {
                return message.channel.send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setDescription("<a:no:954773357407113298> | You need to specify a response")
                            .setColor(Discord.Colors.Red)
                    ]
                });
            }

            await Tag.updateOne({ name: name }, { response: response });

            return message.channel.send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`<a:yes:954773528153059350> | Tag \`${name}\` has been updated.`)
                        .setColor(Discord.Colors.Green)
                ]
            });
        }

        if (args[0] === "list") {

            let tags = await Tag.find({});

            if (tags.length === 0) {
                return message.channel.send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setDescription("<a:no:954773357407113298> | No tags found")
                            .setColor(Discord.Colors.Red)
                    ]
                });
            }

            let tagList = tags.map(tag => `\`${tag.name}\``).join(", ");

            return message.channel.send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`Here are the available tags:\n${tagList}`)
                        .setColor(Discord.Colors.Green)
                ]
            });
        }
            }

            let tags = await Tag.find({});

            if (tags.length === 0) {
                return message.channel.send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setDescription("<a:no:954773357407113298> | No tags found")
                            .setColor(Discord.Colors.Red)
                    ]
                });
            }

            let tagList = tags.map(tag => `\`${tag.name}\``).join(", ");

            return message.channel.send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`Here are the available tags:\n${tagList}`)
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
