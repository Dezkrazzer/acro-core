const fs = require("fs");

module.exports = (client) => {

    client.commands = new Map();
    client.slashArray = [];

    let folders = fs.readdirSync("./commands/");
    folders.forEach((dir) => {
        const commandFiles = fs.readdirSync(`./commands/${dir}`).filter((file) => file.endsWith(".js"));
        for (const file of commandFiles) {
            const command = require(`../../commands/${dir}/${file}`);

            if (!command.name) continue;

            client.commands.set(command.name, command);

            // Daftarkan slash command jika ada
            if (command.data) {
                client.slashArray.push(command.data.toJSON());
            }
        }
    });

    client.logger.log(`> ✅ • All COMMAND successfully loaded`, "success");
};

