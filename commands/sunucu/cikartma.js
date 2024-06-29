const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    cooldown: 20,
    data: new SlashCommandBuilder()
        .setName('cikartma')
        .setDescription('Çıkartma yönetimi komutları.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers)
        .addSubcommand(subcommand =>
            subcommand
                .setName('ekle')
                .setDescription('Sunucuya yeni bir çıkartma ekler.')
                .addAttachmentOption(option => option.setName('cikartma').setDescription('Çıkartma dosyası (PNG, JPG, GIF).').setRequired(true))
                .addStringOption(option => option.setName('isim').setDescription('Çıkartma adı.').setRequired(true))
                .addStringOption(option => option.setName('etiketler').setDescription('Çıkartma etiketleri (virgülle ayırın).').setRequired(true))
                .addStringOption(option => option.setName('tanim').setDescription('Çıkartma tanımı (isteğe bağlı).'))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('listele')
                .setDescription('Sunucudaki çıkartmaları listeler.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('sil')
                .setDescription('Sunucudan bir çıkartma siler.')
                .addStringOption(option => option.setName('cikartma').setDescription('Silinecek çıkartma adı.').setRequired(true))
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'ekle') {
            const cikartmaFile = interaction.options.getAttachment('cikartma');
            const cikartmaName = interaction.options.getString('isim');
            const cikartmaTags = interaction.options.getString('etiketler').split(',');
            const cikartmaDescription = interaction.options.getString('tanim') || "";

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('cikartma_ekle_onay')
                        .setLabel('Onayla')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('cikartma_ekle_iptal')
                        .setLabel('İptal')
                        .setStyle(ButtonStyle.Danger)
                );

            const message = await interaction.reply({ content: 'Çıkartma eklemek istediğinden emin misin?', components: [row], fetchReply: true });

            const collectorFilter = i => i.user.id === interaction.user.id;
            const collector = message.createMessageComponentCollector({ filter: collectorFilter, componentType: 2, time: 30000 });

            collector.on('collect', async i => {
                await i.deferReply();
                await message.delete(); 
                if (i.customId === 'cikartma_ekle_onay') {
                    try {
                        const sticker = await interaction.guild.stickers.create({
                            file: cikartmaFile,
                            name: cikartmaName,
                            description: cikartmaDescription,
                            tags: cikartmaTags
                        });

                        const embed = new EmbedBuilder()
                            .setTitle("Çıkartma Başarıyla Eklendi!")
                            .setDescription(`\`${sticker.name}\` çıkartması başarıyla eklendi!`)
                            .setImage(sticker.url)
                            .setColor("#00FF00");

                        await i.followUp({ embeds: [embed] }); 

                    } catch (error) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle("Hata!")
                            .setDescription('Çıkartma oluşturulurken bir hata oluştu. Lütfen dosya boyutunu ve formatını kontrol edin.')
                            .setColor("#FF0000");
                        await i.followUp({ embeds: [errorEmbed], ephemeral: true }); 
                    }
                } else if (i.customId === 'cikartma_ekle_iptal') {
                    const cancelEmbed = new EmbedBuilder()
                        .setTitle("İşlem İptal Edildi")
                        .setDescription('Çıkartma ekleme işlemi iptal edildi.')
                        .setColor("#FFFF00");
                    await i.followUp({ embeds: [cancelEmbed], ephemeral: true });
                }
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    const timeoutEmbed = new EmbedBuilder()
                        .setTitle("Zaman Aşımı")
                        .setDescription('Çıkartma ekleme işlemi zaman aşımına uğradı.')
                        .setColor("#FF0000");
                    interaction.editReply({ embeds: [timeoutEmbed], components: [] });
                }
            });
        } else if (subcommand === 'listele') {
            const stickers = interaction.guild.stickers.cache;
            if (stickers.size === 0) {
                const embed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle("Sunucu Çıkartmaları")
                    .setDescription("Bu sunucuda hiç çıkartma bulunmuyor.");
                await interaction.reply({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setColor("#0099ff")
                    .setTitle("Sunucu Çıkartmaları")
                    .setDescription(stickers.map(sticker => `\`${sticker.name}\` - ${sticker.name}`).join('\n'));
                await interaction.reply({ embeds: [embed] });
            }
        } else if (subcommand === 'sil') {
            const cikartmaName = interaction.options.getString('cikartma');
            const sticker = interaction.guild.stickers.cache.find(sticker => sticker.name === cikartmaName);
            if (!sticker) {
                const notFoundEmbed = new EmbedBuilder()
                    .setTitle("Çıkartma Bulunamadı!")
                    .setDescription('Belirtilen çıkartma bulunamadı!')
                    .setColor("#FF0000");
                return interaction.reply({ embeds: [notFoundEmbed], ephemeral: true });
            }

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('cikartma_sil_onay')
                        .setLabel('Onayla')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('cikartma_sil_iptal')
                        .setLabel('İptal')
                        .setStyle(ButtonStyle.Secondary)
                );
            const message = await interaction.reply({ content: `${sticker.name} çıkartmasını silmek istediğinden emin misin?`, components: [row], fetchReply: true });

            const collectorFilter = i => i.user.id === interaction.user.id;
            const collector = message.createMessageComponentCollector({ filter: collectorFilter, componentType: 2, time: 30000 });

            collector.on('collect', async i => {
                await i.deferReply();
                await message.delete(); 
                if (i.customId === 'cikartma_sil_onay') {
                    try {
                        await sticker.delete();
                        const embed = new EmbedBuilder()
                            .setTitle("Çıkartma Silindi!")
                            .setDescription(`\`${sticker.name}\` adlı çıkartma başarıyla silindi!`)
                            .setColor("#FF0000");
                        await i.followUp({ embeds: [embed], ephemeral: true });
                    } catch (error) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle("Hata!")
                            .setDescription('Çıkartma silinirken bir hata oluştu!')
                            .setColor("#FF0000");
                        await i.followUp({ embeds: [errorEmbed], ephemeral: true });
                    }
                } else if (i.customId === 'cikartma_sil_iptal') {
                    const cancelEmbed = new EmbedBuilder()
                        .setTitle("İşlem İptal Edildi")
                        .setDescription('Çıkartma silme işlemi iptal edildi.')
                        .setColor("#FFFF00");
                    await i.followUp({ embeds: [cancelEmbed], ephemeral: true });
                }
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    const timeoutEmbed = new EmbedBuilder()
                    .setTitle("Zaman Aşımı")
                        .setDescription('Çıkartma silme işlemi zaman aşımına uğradı.')
                        .setColor("#FF0000");
                    interaction.editReply({ embeds: [timeoutEmbed], components: [] });
                }
            });
        }
    }
};