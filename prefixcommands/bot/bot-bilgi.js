const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 10,
	name: "bot-bilgi",
    aliases: ["botinfo", "botbilgi", "botbilgileri"],
	async execute(message) {
		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Bot Bilgileri')
			.setThumbnail(message.client.user.displayAvatarURL())
			.addFields(
				{ name: 'Bot Adı', value: message.client.user.tag, inline: true },
				{ name: 'Bot ID', value: message.client.user.id, inline: true },
				{ name: 'Node.js Sürümü', value: process.version, inline: true },
				{ name: 'Discord.js Sürümü', value: require('discord.js').version, inline: true },
				{ name: 'Sunucu Sayısı', value: message.client.guilds.cache.size.toString(), inline: true },
				{ name: 'Kullanıcı Sayısı', value: message.client.users.cache.size.toString(), inline: true },
			)
			.setTimestamp();

		await message.reply({ embeds: [embed] });
	},
};