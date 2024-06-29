const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'ping',
    description: 'Botun gecikmesini gösterir.',
    execute(message) {
        const embed = new EmbedBuilder()
            .setTitle('Pong!')
            .setDescription(`Gecikme: ${Date.now() - message.createdTimestamp}ms`);

        message.channel.send({ embeds: [embed] });
    },
};