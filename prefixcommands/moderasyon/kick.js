const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'kick',
    description: 'Bir kullanıcıyı sunucudan atar.',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply('Bu komutu kullanmak için `Üyeleri At` yetkisine sahip olmalısın.');
        }

        await message.reply("Moderasyon komutlarından en iyi şekilde yararlanabilmek için slash olarak kullanın. `/yardım`")
    }
};
