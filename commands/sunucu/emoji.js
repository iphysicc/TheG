const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emoji')
        .setDescription('Emoji yönetimi komutları.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers)
        .addSubcommand(subcommand =>
            subcommand
                .setName('ekle')
                .setDescription('Sunucuya yeni bir emoji ekler.')
                .addAttachmentOption(option => option.setName('emoji').setDescription('Emoji dosyası (PNG, JPG, GIF).').setRequired(true))
                .addStringOption(option => option.setName('isim').setDescription('Emoji adı.').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('listele')
                .setDescription('Sunucudaki emojileri listeler.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('sil')
                .setDescription('Sunucudan bir emoji siler.')
                .addStringOption(option => option.setName('emoji').setDescription('Silinecek emoji.').setRequired(true))
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'ekle') {
            const emojiFile = interaction.options.getAttachment('emoji');
            const emojiName = interaction.options.getString('isim');

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('emoji_ekle_onay')
                        .setLabel('Onayla')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('emoji_ekle_iptal')
                        .setLabel('İptal')
                        .setStyle(ButtonStyle.Danger)
                );

            const message = await interaction.reply({ content: 'Emoji eklemek istediğinden emin misin?', components: [row] });

            const collector = message.createMessageComponentCollector({ componentType: 2, time: 15000 });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) return;

                if (i.customId === 'emoji_ekle_onay') {
                    try {
                        const emoji = await interaction.guild.emojis.create({ attachment: emojiFile.url, name: emojiName });
                        await i.update({ content: `${emoji} adlı emoji başarıyla eklendi!`, components: [] });
                    } catch (error) {
                        await i.update({ content: 'Emoji eklenirken bir hata oluştu!', components: [] });
                    }
                } else if (i.customId === 'emoji_ekle_iptal') {
                    await i.update({ content: 'Emoji ekleme işlemi iptal edildi.', components: [] });
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({ content: 'Emoji ekleme işlemi zaman aşımına uğradı.', components: [] });
                }
            });

        } else if (subcommand === 'listele') {
            const emojis = interaction.guild.emojis.cache;
            if (emojis.size === 0) {
                await interaction.reply('Bu sunucuda hiç emoji bulunmuyor.');
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Sunucu Emojileri')
                    .setDescription(emojis.map(emoji => `${emoji} - \`:${emoji.name}:\``).join('\n'));
                await interaction.reply({ embeds: [embed] });
            }
        } else if (subcommand === 'sil') {
            const emojiName = interaction.options.getString('emoji');
            const emoji = interaction.guild.emojis.cache.find(emoji => emoji.name === emojiName || emoji.toString() === emojiName);
            if (!emoji) {
                return interaction.reply({ content: 'Belirtilen emoji bulunamadı!', ephemeral: true });
            }
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('emoji_sil_onay')
                        .setLabel('Onayla')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('emoji_sil_iptal')
                        .setLabel('İptal')
                        .setStyle(ButtonStyle.Secondary)
                );
            const message = await interaction.reply({ content: `${emoji} emojisini silmek istediğinden emin misin?`, components: [row] });
            const collector = message.createMessageComponentCollector({ componentType: 2, time: 15000 });
            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) return;
                if (i.customId === 'emoji_sil_onay') {
                    try {
                        await emoji.delete();
                        await i.update({ content: `${emoji} adlı emoji başarıyla silindi!`, components: [] });
                    } catch (error) {
                        await i.update({ content: 'Emoji silinirken bir hata oluştu!', components: [] });
                    }
                } else if (i.customId === 'emoji_sil_iptal') {
                    await i.update({ content: 'Emoji silme işlemi iptal edildi.', components: [] });
                }
            });
            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({ content: 'Emoji silme işlemi zaman aşımına uğradı.', components: [] });
                }
            });
        }
    }
};
