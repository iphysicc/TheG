const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./databases/reklam_engel.json" });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reklamengel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('Reklam engelleme sistemini yönetir.'),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        let durum = db.get(`reklamEngel_${guildId}`) || false; 

        const embed = new EmbedBuilder()
            .setColor(durum ? '#00FF00' : '#FF0000')
            .setTitle('Reklam Engel Durumu')
            .setDescription(`Reklam engel şu anda **${durum ? 'Açık' : 'Kapalı'}**`);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('reklamEngelAc')
                    .setLabel('Aç')
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(durum),
                new ButtonBuilder()
                    .setCustomId('reklamEngelKapat')
                    .setLabel('Kapat')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(!durum)
            );

        await interaction.reply({ embeds: [embed], components: [row] });

        const collectorFilter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter: collectorFilter, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'reklamEngelAc') {
                db.set(`reklamEngel_${guildId}`, true);
                embed.setColor('#00FF00').setDescription('Reklam engel açıldı.');
                row.components[0].setDisabled(true);
                row.components[1].setDisabled(false);
            } else if (i.customId === 'reklamEngelKapat') {
                db.set(`reklamEngel_${guildId}`, false);
                embed.setColor('#FF0000').setDescription('Reklam engel kapatıldı.');
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
