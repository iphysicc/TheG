const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./databases/kufur_engel.json" });

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('küfürengel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('Küfür engelleme sistemini yönetir.'),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        let durum = db.get(`küfürEngel_${guildId}`) || false; // Varsayılan olarak kapalı

        const embed = new EmbedBuilder()
            .setColor(durum ? '#00FF00' : '#FF0000')
            .setTitle('Küfür Engel Durumu')
            .setDescription(`Küfür engel şu anda **${durum ? 'Açık' : 'Kapalı'}**`);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('küfürEngelAc')
                    .setLabel('Aç')
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(durum),
                new ButtonBuilder()
                    .setCustomId('küfürEngelKapat')
                    .setLabel('Kapat')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(!durum)
            );

        await interaction.reply({ embeds: [embed], components: [row] });

        const collectorFilter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter: collectorFilter, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'küfürEngelAc') {
                db.set(`küfürEngel_${guildId}`, true);
                embed.setColor('#00FF00').setDescription('Küfür engel açıldı.');
                row.components[0].setDisabled(true);
                row.components[1].setDisabled(false);
            } else if (i.customId === 'küfürEngelKapat') {
                db.set(`küfürEngel_${guildId}`, false);
                embed.setColor('#FF0000').setDescription('Küfür engel kapatıldı.');
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
