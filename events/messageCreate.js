const { Events } = require("discord.js");
const { checkLevelUp } = require("../utils/seviyekontrol.js"); // Fonksiyonu import et
const reklamengel = require("../utils/reklamengel.js");
const spamengel = require("../utils/spamengel.js");
const küfürengel = require("../utils/kufurengel.js");
const afkUtils = require("../utils/afkcheck");
const botetiket = require("../utils/botetiket.js");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        reklamengel(message);
        spamengel(message);
        küfürengel(message);
        afkUtils.handleAfkMentions(message);
        afkUtils.handleAfkReturn(message);
        if (message.mentions.has(message.client.user)) botetiket(message);

        checkLevelUp(message); 
    },
};