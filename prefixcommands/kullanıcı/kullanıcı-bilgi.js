//kullanıcı-bilgi komudu
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'kullanıcı-bilgi',
    cooldown: 10,
    description: 'Bir kullanıcının bilgilerini gösterir.',
    execute(message, args) {
        const targetUser = message.mentions.users.first() || message.author;

        const embed = new EmbedBuilder()
            .setTitle(`${targetUser.tag} Kullanıcı Bilgileri`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Kullanıcı Adı', value: targetUser.username, inline: true },
                { name: 'ID', value: targetUser.id, inline: true },
                { name: 'Hesap Oluşturma Tarihi', value: targetUser.createdAt.toLocaleDateString(), inline: true },
                { name: 'Sunucuya Katılma Tarihi', value: message.member.joinedAt.toLocaleDateString(), inline: true },
            );

        message.channel.send({ embeds: [embed] });
    },
};