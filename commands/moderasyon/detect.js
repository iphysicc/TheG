const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("kelime-tespit")
    .setDescription("Belirtilen kelimeyi sunucudaki mesajlarda arar ve bulursa siler.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((option) =>
      option
        .setName("kelime")
        .setDescription("Aranacak kelime")
        .setRequired(true)
    ),
  async execute(interaction) {
    const kelime = interaction.options.getString("kelime").toLowerCase(); // Kelimeyi küçük harfe çevir
    const channel = interaction.channel;

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`Kelime Tespit: ${kelime}`)
      .setDescription("Kelime tespit işlemi başlatıldı. Lütfen bekleyin...");

    await interaction.reply({ embeds: [embed] });

    let silinenMesajSayisi = 0;
    let mesajYazarlari = new Set();

    const mesajlar = await channel.messages.fetch({ limit: 100 });

    for (const mesaj of mesajlar.values()) {
      if (mesaj.content.toLowerCase().includes(kelime)) { // Mesaj içeriğini küçük harfe çevir
        await mesaj.delete();
        silinenMesajSayisi++;
        mesajYazarlari.add(mesaj.author.tag);
        await new Promise((resolve) => setTimeout(resolve, 500)); // Rate limit için bekleme
      }
    }

    embed.setDescription(`Kelime tespit işlemi tamamlandı!`);
    embed.addFields(
      {
        name: "Silinen Mesaj Sayısı",
        value: silinenMesajSayisi.toString(),
        inline: true,
      },
      {
        name: "Mesaj Yazarları",
        value:
          mesajYazarlari.size > 0
            ? Array.from(mesajYazarlari).join(", ")
            : "Yok",
        inline: true,
      }
    );

    await interaction.editReply({ embeds: [embed] });
  },
};
