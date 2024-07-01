const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
  } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adlari-sifirla')
    .setDescription('Tüm kullanıcıların adlarını görüntülenen adlarına sıfırlar.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply('Bu komutu kullanmak için yönetici iznine ihtiyacın var!');
    }

    const guild = interaction.guild;
    let successCount = 0;
    let errorCount = 0;

    await interaction.reply('Kullanıcı adları sıfırlanıyor, lütfen bekleyin...');

    try {
      for (const member of guild.members.cache.values()) {
        if (member.user.bot) continue; // Botları atla

        try {
          await member.setNickname(member.displayName);
          successCount++;
        } catch (error) {
          return errorCount++;
        }
      }

      await interaction.editReply(`İşlem tamamlandı! Başarıyla sıfırlanan: ${successCount}, Hata oluşan: ${errorCount}`);
    } catch (error) {
      console.error('Genel bir hata oluştu:', error);
      await interaction.editReply('Bir hata oluştu, kullanıcı adları sıfırlanamadı.');
    }
  },
};
