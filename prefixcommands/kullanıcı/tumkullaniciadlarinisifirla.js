const { EmbedBuilder } = require('discord.js');

module.exports = {
  cooldown: 10,
  name: 'adlari-sifirla',
  description: 'Tüm kullanıcıların adlarını görüntülenen adlarına sıfırlar.',
  async execute(message) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply({ content: 'Bu komutu kullanmak için yönetici iznine ihtiyacın var!', ephemeral: true });
    }

    const guild = message.guild;
    let successCount = 0;
    let errorCount = 0;

    const loadingEmbed = new EmbedBuilder()
      .setTitle('Lütfen bekleyin...')
      .setDescription('Kullanıcı adları sıfırlanıyor...');

    await message.reply({ embeds: [loadingEmbed] });

    try {
      for (const member of guild.members.cache.values()) {
        if (member.user.bot) continue; 

        try {
          await member.setNickname(member.displayName);
          successCount++;
        } catch (error) {
          return errorCount++;
        }
      }

      const resultEmbed = new EmbedBuilder()
        .setTitle('İşlem tamamlandı!')
        .setDescription(`Başarıyla sıfırlanan: ${successCount}\nHata oluşan: ${errorCount}`);

      await message.reply({ embeds: [resultEmbed] });
    } catch (error) {
      console.error('Genel bir hata oluştu:', error);
      const errorEmbed = new EmbedBuilder()
        .setTitle('Hata!')
        .setDescription('Bir hata oluştu, kullanıcı adları sıfırlanamadı.');
      await message.reply({ embeds: [errorEmbed] });
    }
  },
};
