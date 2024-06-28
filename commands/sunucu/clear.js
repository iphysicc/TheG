const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("temizle")
    .setDescription("Belirtilen sayıda mesajı siler (en fazla 1000).")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((option) =>
      option
        .setName("sayı")
        .setDescription("Silinecek mesaj sayısı (1-500)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(500)
    ),
  async execute(interaction) {
    const sayi = interaction.options.getInteger("sayı");
    const channel = interaction.channel;

    let silinenMesajSayisi = 0;
    let lastMessageId = null;

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Mesaj Temizleme")
      .setDescription(`Toplam ${sayi} mesaj silinecek. Lütfen bekleyin...`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] }); 

    while (silinenMesajSayisi < sayi) {
      const silinecekAdet = Math.min(sayi - silinenMesajSayisi, 100);
      const mesajlar = await channel.messages.fetch({
        limit: silinecekAdet,
        before: lastMessageId,
      });

      if (mesajlar.size === 0) break;

      const silinenler = await channel.bulkDelete(mesajlar);
      silinenMesajSayisi += silinenler.size;
      lastMessageId = mesajlar.last().id;

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Yeni mesaj oluştur ve gönder
    const yeniMesaj = await interaction.followUp({
      content: `${silinenMesajSayisi} mesaj silindi.`,
    });

    // Yeni mesajı 3 saniye sonra sil
    setTimeout(async () => {
      try {
        await yeniMesaj.delete();
      } catch (error) {
        console.error("Sonuç mesajı silinirken bir hata oluştu:", error);
      }
    }, 3000);
  },
};
