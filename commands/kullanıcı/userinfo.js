const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('kullanıcı-bilgi')
		.setDescription('belirtilen kullanıcı hakkında bilgi verir.')
		.addUserOption(option => option.setName('user').setDescription('Kullanıcı')),
	async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`${user.tag} (${user.id})`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: 'Katılma Tarihi', value: `<t:${Math.round(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: 'Hesap Oluşturma Tarihi', value: `<t:${Math.round(user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Roller', value: member.roles.cache.size > 10 ? 'Çok fazla rol!' : member.roles.cache.map(role => `<@&${role.id}>`).join(', '), inline: true },
                { name: 'Durum', value: member.presence?.status || 'Çevrimdışı', inline: true },
                { name: 'Oyun', value: member.presence?.activities?.[0]?.name || 'Oyun Oynamıyor', inline: true },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
	},
};