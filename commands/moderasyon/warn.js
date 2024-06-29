const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./databases/warnings.json" });

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('uyarı')
        .setDescription('Uyarı sistemi komutları.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand
                .setName('ver')
                .setDescription('Kullanıcıya uyarı verir.')
                .addUserOption(option => option.setName('kullanıcı').setDescription('Uyarılacak kullanıcı.').setRequired(true))
                .addStringOption(option => option.setName('sebep').setDescription('Uyarı sebebi.').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('görüntüle')
                .setDescription('Kullanıcının uyarılarını görüntüler.')
                .addUserOption(option => option.setName('kullanıcı').setDescription('Uyarıları görüntülenecek kullanıcı.').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('kaldır')
                .setDescription('Kullanıcının belirtilen uyarısını kaldırır.')
                .addUserOption(option => option.setName('kullanıcı').setDescription('Uyarısı kaldırılacak kullanıcı.').setRequired(true))
                .addIntegerOption(option => option.setName('uyarı_numarası').setDescription('Kaldırılacak uyarının numarası (1\'den başlar).').setRequired(true))
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'ver') {
            const user = interaction.options.getUser('kullanıcı');
            const reason = interaction.options.getString('sebep');

            const uyarı = {
                moderator: interaction.user.tag,
                reason: reason,
                timestamp: new Date().toLocaleString() 
            };
            
            db.push(`uyarılar_${user.id}`, uyarı);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Uyarı Verildi')
                .setDescription(`${user} adlı kullanıcıya uyarı verildi.`)
                .addFields(
                    { name: 'Sebep', value: reason },
                    { name: 'Moderatör', value: interaction.user.tag },
                    { name: 'Tarih', value: uyarı.timestamp } 
                );
            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'görüntüle') {
            const user = interaction.options.getUser('kullanıcı');
            const uyarilar = db.get(`uyarılar_${user.id}`) || [];

            if (uyarilar.length === 0) {
                await interaction.reply(`${user} adlı kullanıcının hiç uyarısı yok.`);
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#FFFF00')
                    .setTitle(`${user.tag} Kullanıcısının Uyarıları`)
                    .setDescription(uyarilar.map((uyarı, index) => `**${index + 1}. Uyarı:**\nSebep: ${uyarı.reason}\nModeratör: ${uyarı.moderator}\nTarih: ${uyarı.timestamp}`).join('\n\n'));
                await interaction.reply({ embeds: [embed] });
            }
        } else if (subcommand === 'kaldır') { 
            const user = interaction.options.getUser('kullanıcı');
            const uyarıNumarası = interaction.options.getInteger('uyarı_numarası') - 1; 
            const uyarilar = db.get(`uyarılar_${user.id}`) || [];

            if (uyarıNumarası < 0 || uyarıNumarası >= uyarilar.length) {
                await interaction.reply('Geçersiz uyarı numarası.');
            } else {
                const kaldırılanUyarı = uyarilar.splice(uyarıNumarası, 1)[0];
                db.set(`uyarılar_${user.id}`, uyarilar);

                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('Uyarı Kaldırıldı')
                    .setDescription(`${user} adlı kullanıcının ${uyarıNumarası + 1}. uyarısı kaldırıldı.`)
                    .addFields(
                        { name: 'Sebep', value: kaldırılanUyarı.reason },
                        { name: 'Moderatör', value: kaldırılanUyarı.moderator },
                        { name: 'Tarih', value: kaldırılanUyarı.timestamp }
                    );
                await interaction.reply({ embeds: [embed] });
            }
        }
    }
};
