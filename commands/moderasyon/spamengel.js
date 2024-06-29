const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./databases/spam_engel.json" });

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('spamengel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('Spam engelleme sistemini yönetir.'),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        let durum = db.get(`spamEngel_${guildId}`) || false; 

        const embed = new EmbedBuilder()
            .setColor(durum ? '#00FF00' : '#FF0000')
            .setTitle('Spam Engel Durumu')
            .setDescription(`Spam engel şu anda **${durum ? 'Açık' : 'Kapalı'}**`);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('spamEngelAc')
                    .setLabel('Aç')
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(durum),
                new ButtonBuilder()
                    .setCustomId('spamEngelKapat')
                    .setLabel('Kapat')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(!durum)
            );

        await interaction.reply({ embeds: [embed], components: [row] });

        const collectorFilter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter: collectorFilter, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'spamEngelAc') {
                db.set(`spamEngel_${guildId}`, true);
                embed.setColor('#00FF00').setDescription('Spam engel açıldı.');
                row.components[0].setDisabled(true);
                row.components[1].setDisabled(false);
            } else if (i.customId === 'spamEngelKapat') {
                db.set(`spamEngel_${guildId}`, false);
                embed.setColor('#FF0000').setDescription('Spam engel kapatıldı.');
                row.components[0].setDisabled(false);
                row.components[1].setDisabled(true);
            }

            await i.update({ embeds: [embed], components: [row] });
            collector.stop();
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                row.components.forEach(button => button.setDisabled(true));
                interaction.editReply({ components: [row] });
            }
        });
    }
};
