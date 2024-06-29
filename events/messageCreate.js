const { Events } = require("discord.js");
const { checkLevelUp } = require("../utils/seviyekontrol.js"); // Fonksiyonu import et
const reklamengel = require("../utils/reklamengel.js");
const spamengel = require("../utils/spamengel.js");
const küfürengel = require("../utils/kufurengel.js");
const afkUtils = require("../utils/afkcheck");
const prefixcommandcheck = require("../utils/prefixcommandcheck.js");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        const client = message.client;
        prefixcommandcheck(message, client);
        reklamengel(message);
        spamengel(message);
        küfürengel(message);
        afkUtils.handleAfkMentions(message);
        afkUtils.handleAfkReturn(message);
        if (message.mentions.has(message.client.user)){
            message.reply("Ta kendisiyim, komutlar için `/yardım`")
        };

        checkLevelUp(message); 
    },
};