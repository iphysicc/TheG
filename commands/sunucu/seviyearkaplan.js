const { SlashCommandBuilder } = require('discord.js');
const { JsonDatabase } = require("wio.db");

const db = new JsonDatabase({
    databasePath: "./databases/levels.json",
});

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('seviyearkaplanayarla')
        .setDescription('Seviye kartı arka planını ayarla.')
        .addStringOption(option => 
            option.setName('url')
                .setDescription('Arka plan resmi URL\'si')
                .setRequired(true)
        ),
    async execute(interaction) {
        const backgroundURL = interaction.options.getString('url');
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        db.set(`${guildId}-${userId}.arkaPlan`, backgroundURL);
        interaction.reply("Arka plan resmin başarıyla ayarlandı!");
    }
};
