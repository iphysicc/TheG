const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Belirtilen kanalı kilitler.')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Kilitlemek istediğiniz kanal.')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), 
    async execute(interaction) {
        const channel = interaction.options.getChannel('kanal');

        if (!channel.isTextBased()) {
            return interaction.reply({ content: 'Sadece metin kanalları kilitlenebilir.', ephemeral: true });
        }

        try {
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
            await interaction.reply(`🔒 ${channel} kanalı başarıyla kilitlendi.`);
        } catch (error) {
            console.error(`Kanal kilitleme hatası: ${error}`);
            await interaction.reply({ content: 'Kanalı kilitlemeye çalışırken bir hata oluştu.', ephemeral: true });
        }
    },
};
