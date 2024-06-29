const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('bot-bilgi')
		.setDescription('Bot hakkında bilgi verir.'),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Bot Bilgileri')
			.setThumbnail(interaction.client.user.displayAvatarURL())
			.addFields(
				{ name: 'Bot Adı', value: interaction.client.user.tag, inline: true },
				{ name: 'Bot ID', value: interaction.client.user.id, inline: true },
				{ name: 'Node.js Sürümü', value: process.version, inline: true },
				{ name: 'Discord.js Sürümü', value: require('discord.js').version, inline: true },
				{ name: 'Sunucu Sayısı', value: interaction.client.guilds.cache.size.toString(), inline: true },
				{ name: 'Kullanıcı Sayısı', value: interaction.client.users.cache.size.toString(), inline: true },
			)
			.setTimestamp();

		await interaction.reply({ embeds: [embed] });
	},
};