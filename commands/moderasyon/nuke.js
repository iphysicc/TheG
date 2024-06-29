const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('nuke')
        .setDescription('Kanalı temizler ve kopyasını oluşturur.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        
    async execute(interaction) {
        const channel = interaction.channel;

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('nuke_onay')
                    .setLabel('Onayla')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('nuke_iptal')
                    .setLabel('İptal')
                    .setStyle(ButtonStyle.Secondary)
            );

        const message = await interaction.reply({ content: 'Kanalı bombalamak istediğinden emin misin? Bu işlem geri alınamaz!', components: [row] });

        const collector = message.createMessageComponentCollector({ componentType: 2, time: 15000 }); 

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return;

            if (i.customId === 'nuke_onay') {
                const position = channel.position;
                const newChannel = await channel.clone({ name: channel.name, reason: `Nuked by ${interaction.user.tag}` });
                await channel.delete();
                await newChannel.setPosition(position);
                await newChannel.send(`Kanal ${interaction.user} tarafından bombalandı!`);
            } else if (i.customId === 'nuke_iptal') {
                await i.update({ content: 'Nuke işlemi iptal edildi.', components: [] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: 'Nuke işlemi zaman aşımına uğradı.', components: [] });
            }
        });
    },
};
