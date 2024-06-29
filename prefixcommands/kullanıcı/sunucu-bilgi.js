const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'sunucu-bilgi',
    cooldown: 10,
    description: 'Sunucunun bilgilerini gösterir.',
    execute(message) {
        const guild = message.guild;

        const embed = new EmbedBuilder()
            .setTitle(`${guild.name} Sunucu Bilgileri`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: 'Sunucu Adı', value: guild.name, inline: true },
                { name: 'ID', value: guild.id, inline: true },
                { name: 'Üye Sayısı', value: guild.memberCount.toString(), inline: true },
                { name: 'Oluşturma Tarihi', value: guild.createdAt.toLocaleDateString(), inline: true },
                { name: 'Sahip', value: `<@${guild.ownerId}>`, inline: true },
            );

        message.channel.send({ embeds: [embed] });
    },
};