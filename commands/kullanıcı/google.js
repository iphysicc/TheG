const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
} = require("discord.js");
const googleIt = require("google-it");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("google")
    .setDescription("Google'da arama yapar ve sonuçları gösterir.")
    .addStringOption((option) =>
      option
        .setName("sorgu")
        .setDescription("Aramak istediğiniz kelime veya cümle")
        .setRequired(true)
    ),

  async execute(interaction) {
    const sorgu = interaction.options.getString("sorgu");

    try {
      const results = await googleIt({
        query: sorgu,
        limit: 10,
        disableConsole: true,
      });

      const embed = new EmbedBuilder()
        .setTitle(`Google Arama Sonuçları: ${sorgu}`)
        .setDescription("Listedeki sonuçlardan birini seçin.")
        .setColor(0x4285f4);

      const options = results.map((result, index) => ({
        label: result.title.slice(0, 100),
        description: result.snippet.slice(0, 100),
        value: index.toString(),
      }));

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("google_result_select")
        .setPlaceholder("Bir sonuç seçin.")
        .addOptions(options);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({ embeds: [embed], components: [row] });

      const collectorFilter = (i) =>
        i.user.id === interaction.user.id &&
        i.customId === "google_result_select";

      const collector = interaction.channel.createMessageComponentCollector({
        filter: collectorFilter,
        componentType: ComponentType.StringSelect,
        time: 60000,
      });

      collector.on("collect", async (i) => {
        const selectedIndex = parseInt(i.values[0]);
        const selectedResult = results[selectedIndex];

        const resultEmbed = new EmbedBuilder()
          .setTitle(selectedResult.title)
          .setURL(selectedResult.link)
          .setDescription(selectedResult.snippet)
          .setColor(0x4285f4);

        await i.update({ embeds: [resultEmbed], components: [] });
      });

      collector.on("end", (collected) => {
        if (collected.size === 0) {
          interaction.editReply({ components: [] });
        }
      });
    } catch (error) {
      console.error("Google arama hatası:", error);
      await interaction.reply({
        content: "Arama yaparken bir hata oluştu.",
        ephemeral: true,
      });
    }
  },
};
