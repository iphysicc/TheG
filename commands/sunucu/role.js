const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('rol')
        .setDescription('Rol yönetimi komutları.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles) 
        .addSubcommand(subcommand =>
            subcommand
                .setName('ver')
                .setDescription('Kullanıcıya rol verir.')
                .addUserOption(option => option.setName('kullanıcı').setDescription('Rol verilecek kullanıcı.').setRequired(true))
                .addRoleOption(option => option.setName('rol').setDescription('Verilecek rol.').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('al')
                .setDescription('Kullanıcıdan rol alır.')
                .addUserOption(option => option.setName('kullanıcı').setDescription('Rol alınacak kullanıcı.').setRequired(true))
                .addRoleOption(option => option.setName('rol').setDescription('Alınacak rol.').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('bilgi')
                .setDescription('Rol hakkında bilgi verir.')
                .addRoleOption(option => option.setName('rol').setDescription('Bilgisi alınacak rol.').setRequired(true))
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'ver') {
            const member = interaction.options.getMember('kullanıcı');
            const role = interaction.options.getRole('rol');

            await member.roles.add(role);
            await interaction.reply(`${member} adlı kullanıcıya ${role} rolü verildi.`);

        } else if (subcommand === 'al') {
            const member = interaction.options.getMember('kullanıcı');
            const role = interaction.options.getRole('rol');

            await member.roles.remove(role);
            await interaction.reply(`${member} adlı kullanıcıdan ${role} rolü alındı.`);

        } else if (subcommand === 'bilgi') {
            const role = interaction.options.getRole('rol');
            const embed = new EmbedBuilder()
                .setColor(role.color)
                .setTitle(`${role.name} Rol Bilgileri`)
                .addFields(
                    { name: 'ID', value: role.id, inline: true },
                    { name: 'Üye Sayısı', value: role.members.size.toString(), inline: true },
                    { name: 'Renk', value: role.hexColor, inline: true },
                    { name: 'Bahsedilebilir', value: role.mentionable ? 'Evet' : 'Hayır', inline: true },
                    { name: 'Görüntülenebilir', value: role.hoist ? 'Evet' : 'Hayır', inline: true },
                    { name: 'Oluşturulma Tarihi', value: role.createdAt.toLocaleDateString(), inline: true }
                );
            await interaction.reply({ embeds: [embed] });
        }
    }
};
