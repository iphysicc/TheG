const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    PermissionFlagsBits,
  } = require("discord.js");
  const { JsonDatabase } = require("wio.db");
  
  const spamEngelDB = new JsonDatabase({
    databasePath: "./databases/spam_engel.json",
  });
  const küfürEngelDB = new JsonDatabase({
    databasePath: "./databases/kufur_engel.json",
  });
  const reklamEngelDB = new JsonDatabase({
    databasePath: "./databases/reklam_engel.json",
  });
  
  const spamEngelCommand = require("./spamengel");
  const küfürEngelCommand = require("./kufurengel");
  const reklamEngelCommand = require("./reklam-engel");
  
  let activeCollector = null;
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName("ayarlamalar")
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .setDescription("Sunucu ayarlarını yönetin."),
  
    async execute(interaction) {
      const guildId = interaction.guild.id;
  
      if (activeCollector) {
        activeCollector.stop("Yeni ayarlama komutu");
      }
  
      const spamEngel = spamEngelDB.get(`spamEngel_${guildId}`) || false;
      const küfürEngel = küfürEngelDB.get(`küfürEngel_${guildId}`) || false;
      const reklamEngel = reklamEngelDB.get(`reklamEngel_${guildId}`) || false;
  
      const embed = new EmbedBuilder()
        .setTitle("Sunucu Ayarları")
        .setDescription("Yapmak istediğiniz işlem nedir?")
        .addFields(
          {
            name: "Spam Engel",
            value: spamEngel ? "Açık" : "Kapalı",
            inline: true,
          },
          {
            name: "Küfür Engel",
            value: küfürEngel ? "Açık" : "Kapalı",
            inline: true,
          },
          {
            name: "Reklam Engel",
            value: reklamEngel ? "Açık" : "Kapalı",
            inline: true,
          }
        );
  
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("spamEngelAyarla")
          .setLabel("Spam Engel")
          .setStyle(spamEngel ? ButtonStyle.Danger : ButtonStyle.Success)
          .setDisabled(false),
        new ButtonBuilder()
          .setCustomId("küfürEngelAyarla")
          .setLabel("Küfür Engel")
          .setStyle(küfürEngel ? ButtonStyle.Danger : ButtonStyle.Success)
          .setDisabled(false),
        new ButtonBuilder()
          .setCustomId("reklamEngelAyarla")
          .setLabel("Reklam Engel")
          .setStyle(reklamEngel ? ButtonStyle.Danger : ButtonStyle.Success)
          .setDisabled(false)
      );
  
      await interaction.reply({ embeds: [embed], components: [row] });
  
      const collectorFilter = (i) => i.user.id === interaction.user.id;
  
      activeCollector = interaction.channel.createMessageComponentCollector({
        filter: collectorFilter,
        time: 15000,
      });
  
      activeCollector.on("collect", async (i) => {
        const ayar = i.customId.replace("Ayarla", "");
  
        switch (ayar) {
          case "spamEngel":
            await spamEngelCommand.execute(i);
            break;
          case "küfürEngel":
            await küfürEngelCommand.execute(i);
            break;
          case "reklamEngel":
            await reklamEngelCommand.execute(i);
            break;
        }
      });
  
      activeCollector.on("end", (collected, reason) => {
        if (reason === "Yeni ayarlama komutu") return; 
  
        if (collected.size === 0) {
          interaction.editReply({
            content: "Ayar değiştirme süresi doldu.",
            components: [],
          });
        }
  
        activeCollector = null; 
      });
    },
  };
  