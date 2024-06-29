const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Belirtilen kanalın kilidini açar.')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Kilidini açmak istediğiniz kanal.')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        const channel = interaction.options.getChannel('kanal');

        if (!channel.isTextBased()) {
            return interaction.reply({ content: 'Sadece metin kanallarının kilidi açılabilir.', ephemeral: true });
        }

        try {
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
            await interaction.reply(`🔓 ${channel} kanalının kilidi başarıyla açıldı.`);
        } catch (error) {
            console.error(`Kanal kilidi açma hatası: ${error}`);
            await interaction.reply({ content: 'Kanalın kilidini açmaya çalışırken bir hata oluştu.', ephemeral: true });
        }
    },
};
