const { SlashCommandBuilder } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./databases/afk.json" });

module.exports = {
  data: new SlashCommandBuilder()
    .setName("afk")
    .setDescription("AFK moduna geç.")
    .addStringOption((option) =>
      option
        .setName("sebep")
        .setDescription("AFK olma sebebiniz (isteğe bağlı)")
    ),
  async execute(interaction) {
    const reason = interaction.options.getString("sebep") || "Belirtilmedi";

    if (reason.includes("@everyone") || reason.includes("@here")) {
        await interaction.reply({
            content: "Metin içinde @everyone veya @here etiketlerini kullanamazsın!",
            ephemeral: true,
        });
    } else {
      const user = interaction.user;
      const member = interaction.member; 

      if (db.has(`afk_${user.id}`)) {
        return interaction.reply({
          content: "Zaten AFK modundasınız!",
          ephemeral: true,
        });
      }

      db.set(`afk_${user.id}`, { reason, time: Date.now() });

      await interaction.reply({
        content: `AFK moduna geçtiniz. Sebep: ${reason}`,
        ephemeral: true,
      });

      try {
        await member.setNickname(`[AFK] ${member.displayName}`);
      } catch (error) {
        await interaction.followUp({
          content: "İsim değiştirme iznim yok.",
          ephemeral: true,
        });
      }
    }
  },
};
