const config = require("../config.json");
const discord = require("discord.js");

module.exports = async (client) => {

    client.user.setPresence({
        status: "online"
    });
    client.user.setActivity(`Acro Network | play.acronetwork.my.id`, {
        type: discord.ActivityType.Watching
    });

    
    client.logger.log(`> ✅ • ${client.user.username}#${client.user.discriminator} has been online`, "success");

};
