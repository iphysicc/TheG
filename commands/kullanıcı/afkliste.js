const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./databases/afk.json" });

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("afkolanlar")
    .setDescription("AFK olan kullanıcıları listeler."),
  async execute(interaction) {
    const afkUsers = [];

    const allKeys = await db.all();

    for (const { ID: key, data: value } of allKeys) {
      if (key.startsWith("afk_")) {
        const userId = key.replace("afk_", "");
        const member = await interaction.guild.members
          .fetch(userId)
          .catch(() => null);
        if (member) {
          afkUsers.push({
            user: member.user,
            reason: value.reason,
            time: value.time,
          });
        }
      }
    }

    if (afkUsers.length === 0) {
      return interaction.reply({
        content: "Şu anda AFK olan kimse yok.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("AFK Olan Kullanıcılar")
      .setColor("Blue")
      .setDescription(
        afkUsers
          .map(
            (afkUser) => `
**${afkUser.user.tag}** - _${afkUser.reason}_ 
(AFK Süresi: <t:${Math.floor(afkUser.time / 1000)}:R>)
        `
          )
          .join("\n\n")
      );

    await interaction.reply({ embeds: [embed] });
  },
};
