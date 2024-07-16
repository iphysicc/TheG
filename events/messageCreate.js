const { Events } = require("discord.js");
const { checkLevelUp } = require("../utils/seviyekontrol.js"); 
const reklamengel = require("../utils/reklamengel.js");
const küfürengel = require("../utils/kufurengel.js");
const afkUtils = require("../utils/afkcheck");
const prefixcommandcheck = require("../utils/prefixcommandcheck.js");
const ai = require("../utils/ai.js");
const oneri = require("../utils/oneri.js");

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    try {
      if (message.author.bot) return;
      const client = message.client;
      prefixcommandcheck(message, client);
      reklamengel(message);
      küfürengel(message);
      oneri(message);
      ai.handleMessage(message);
      afkUtils.handleAfkMentions(message);
      afkUtils.handleAfkReturn(message);
      checkLevelUp(message); 
    } catch (error) {
      console.error("Hata", error);
    }
  },
};
