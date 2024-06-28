const { EmbedBuilder } = require("discord.js");

async function easyEmbed(title = null, description = null, message) {
  const embed = new EmbedBuilder(); 

  if (title) {
    embed.setTitle(title);
  }

  if (description) {
    embed.setDescription(description);
  }

  await message.reply({ embeds: [embed] }); 

  return embed; 
}

module.exports = { easyEmbed };
