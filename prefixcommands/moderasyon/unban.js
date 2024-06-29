const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'unban',
    description: 'Yasaklanmış bir kullanıcının yasağını kaldırır.',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('Bu komutu kullanmak için `Üyeleri Yasakla` yetkisine sahip olmalısın.');
        }

        await message.reply("Moderasyon komutlarından en iyi şekilde yararlanabilmek için slash olarak kullanın. `/yardım`")
    }
};
