const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'mute',
    description: 'Bir kullanıcıyı belirli bir süreyle veya süresiz olarak susturur.',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('Bu komutu kullanmak için `Üyeleri Sustur` yetkisine sahip olmalısın.');
        }

        await message.reply("Moderasyon komutlarından en iyi şekilde yararlanabilmek için slash olarak kullanın. `/yardım`")
    }
}
