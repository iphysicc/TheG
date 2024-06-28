const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('sunucu-bilgi')
        .setDescription('Sunucu hakkında bilgi verir.'),
    async execute(interaction) {
        const guild = interaction.guild;

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`${guild.name} (${guild.id})`)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: 'Üye Sayısı', value: guild.memberCount.toString(), inline: true }, 
                { name: 'Oluşturma Tarihi', value: `<t:${Math.round(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Sahip', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Boost Seviyesi', value: guild.premiumTier.toString(), inline: true }, 
                { name: 'Boost Sayısı', value: guild.premiumSubscriptionCount.toString(), inline: true }, 
                { name: 'Toplam Rol Sayısı', value: guild.roles.cache.size.toString(), inline: true }, 
                { name: 'Toplam Kanal Sayısı', value: guild.channels.cache.size.toString(), inline: true }, 
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};