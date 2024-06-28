const { EmbedBuilder } = require("discord.js");
const { easyEmbed } = require("./easyembed.js");

async function botetiket(message) {
    const embed = new EmbedBuilder();
    easyEmbed(null, "Ön ekli komutları kullanmayın. Yenilenmiş slash komutlar için `/yardım`", message);
}

module.exports = botetiket;
