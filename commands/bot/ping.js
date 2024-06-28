const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply('Pong!');
		const latency = Date.now() - interaction.createdTimestamp;
		await interaction.editReply(`Pong! \`${latency}ms\``);
	},
};