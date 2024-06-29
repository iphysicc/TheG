
module.exports = {
    name: 'unmute',
    description: 'Susturulmuş bir kullanıcının sesini açar.',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('Bu komutu kullanmak için `Üyeleri Sustur` yetkisine sahip olmalısın.');
        }

        await message.reply("Moderasyon komutlarından en iyi şekilde yararlanabilmek için slash olarak kullanın. `/yardım`")
    }
}
