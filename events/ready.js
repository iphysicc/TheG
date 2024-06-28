const { Events, EmbedBuilder } = require('discord.js');
const deploy_commands = require('../deploy-commands');


module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.user.setActivity('Developed by Physic <3');
	},
};