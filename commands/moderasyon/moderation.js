const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('moderasyon')
        .setDescription('Moderasyon komutları.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand(subcommand =>
            subcommand
                .setName('ban')
                .setDescription('Kullanıcıyı sunucudan yasaklar.')
                .addUserOption(option => option.setName('kullanıcı').setDescription('Yasaklanacak kullanıcı.').setRequired(true))
                .addStringOption(option => option.setName('sebep').setDescription('Yasaklama sebebi.'))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('kick')
                .setDescription('Kullanıcıyı sunucudan atar.')
                .addUserOption(option => option.setName('kullanıcı').setDescription('Atılacak kullanıcı.').setRequired(true))
                .addStringOption(option => option.setName('sebep').setDescription('Atma sebebi.'))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('sustur')
                .setDescription('Kullanıcıyı susturur.')
                .addUserOption(option => option.setName('kullanıcı').setDescription('Susturulacak kullanıcı.').setRequired(true))
                .addStringOption(option => option.setName('sebep').setDescription('Susturma sebebi.'))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('susturmakaldır')
                .setDescription('Kullanıcının susturmasını kaldırır.')
                .addUserOption(option => option.setName('kullanıcı').setDescription('Susturması kaldırılacak kullanıcı.').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('zamanaşımı')
                .setDescription('Kullanıcıya zaman aşımı uygular.')
                .addUserOption(option => option.setName('kullanıcı').setDescription('Zaman aşımı uygulanacak kullanıcı.').setRequired(true))
                .addIntegerOption(option => option.setName('süre').setDescription('Süre (dakika cinsinden).').setRequired(true))
                .addStringOption(option => option.setName('sebep').setDescription('Zaman aşımı sebebi.'))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('zamanaşımıkaldır')
                .setDescription('Kullanıcının zaman aşımını kaldırır.')
                .addUserOption(option => option.setName('kullanıcı').setDescription('Zaman aşımı kaldırılacak kullanıcı.').setRequired(true))
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getMember('kullanıcı');
        const reason = interaction.options.getString('sebep') || 'Belirtilmedi';

        if (!user) {
            return interaction.reply({ content: 'Kullanıcı bulunamadı!', ephemeral: true });
        }

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Onayla')
            .setStyle(ButtonStyle.Danger);
        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('İptal')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(confirmButton, cancelButton);

        let embed = new EmbedBuilder()
            .setTitle('İşlem Onayı')
            .setColor('#ff0000');

        if (subcommand === 'ban') {
            embed.setDescription(`${user} kullanıcısını yasaklamak istediğine emin misin?`);
        } else if (subcommand === 'kick') {
            embed.setDescription(`${user} kullanıcısını sunucudan atmak istediğine emin misin?`);
        } else if (subcommand === 'sustur') {
            embed.setDescription(`${user} kullanıcısını susturmak istediğine emin misin?`);
        } else if (subcommand === 'susturmakaldır') {
            embed.setDescription(`${user} kullanıcısının susturmasını kaldırmak istediğine emin misin?`);
        } else if (subcommand === 'zamanaşımı') {
            const duration = interaction.options.getInteger('süre');
            embed.setDescription(`${user} kullanıcısına ${duration} dakika zaman aşımı uygulamak istediğine emin misin?`);
        } else if (subcommand === 'zamanaşımıkaldır') {
            embed.setDescription(`${user} kullanıcısının zaman aşımını kaldırmak istediğine emin misin?`);
        }

        const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

        const collector = message.createMessageComponentCollector({ componentType: 2, time: 15000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return;

            if (i.customId === 'confirm') {
                try {
                    if (subcommand === 'ban') {
                        await user.ban({ reason });
                        await i.update({ content: `${user} başarıyla yasaklandı!`, embeds: [], components: [] });
                    } else if (subcommand === 'kick') {
                        await user.kick(reason);
                        await i.update({ content: `${user} başarıyla sunucudan atıldı!`, embeds: [], components: [] });
                    } else if (subcommand === 'sustur') {
                        const mutedRole = interaction.guild.roles.cache.find(role => role.name === 'Muted'); 
                        if (!mutedRole) {
                            return i.update({ content: 'Muted rolü bulunamadı!', components: [] });
                        }
                        await user.roles.add(mutedRole);
                        await i.update({ content: `${user} başarıyla susturuldu!`, embeds: [], components: [] });
                    } else if (subcommand === 'susturmakaldır') {
                        const mutedRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
                        if (!mutedRole) {
                            return i.update({ content: 'Muted rolü bulunamadı!', components: [] });
                        }
                        await user.roles.remove(mutedRole);
                        await i.update({ content: `${user} kullanıcısının susturması kaldırıldı!`, embeds: [], components: [] });
                    } else if (subcommand === 'zamanaşımı') {
                        const duration = interaction.options.getInteger('süre');
                        await user.timeout(duration * 60 * 1000, reason); 
                        await i.update({ content: `${user} başarıyla ${duration} dakika zaman aşımına uğratıldı!`, embeds: [], components: [] });
                    } else if (subcommand === 'zamanaşımıkaldır') {
                        await user.timeout(null);
                        await i.update({ content: `${user} kullanıcısının zaman aşımı kaldırıldı!`, embeds: [], components: [] });
                    }
                } catch (error) {
                    await i.update({ content: 'Bu kullanıcıyı susturmam için yetkim yok!', components: [] });
                }
            } else if (i.customId === 'cancel') {
                await i.update({ content: 'İşlem iptal edildi.', embeds: [], components: [] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: 'İşlem zaman aşımına uğradı.', embeds: [], components: [] });
            }
        });
    }
};
