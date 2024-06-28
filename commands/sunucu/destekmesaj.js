const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('destekmesaj')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDescription('Destek mesajını gönderir.'),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    if (interaction.channel.type === ChannelType.DM) {
      await interaction.editReply({ content: 'Bu komut sadece sunucularda kullanılabilir!', ephemeral: true });
      return;
    }

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('destek-ac')
          .setLabel('Destek Talebi Aç')
          .setStyle(ButtonStyle.Primary),
      );

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Destek Talebi')
      .setDescription('Destek talebi açmak için aşağıdaki butona tıklayın.');

    await interaction.editReply({ content: 'Destek mesajı gönderildi.', ephemeral: true });
    const mesaj = await interaction.channel.send({ embeds: [embed], components: [row] });

    const collector = mesaj.createMessageComponentCollector();

    collector.on('collect', async i => {
      if (i.customId === 'destek-ac') {
        if (i.channel.type === ChannelType.DM) {
          await i.reply({ content: 'Bu işlem sadece sunucularda yapılabilir!', ephemeral: true });
          return;
        }

        const modal = new ModalBuilder()
          .setCustomId('destek-konu-modal')
          .setTitle('Destek Talebi Konusu');

        const konuInput = new TextInputBuilder()
          .setCustomId('konu-input')
          .setLabel('Konu')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Lütfen destek talebinizin konusunu kısaca belirtin.')
          .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(konuInput));
        await i.showModal(modal);

        i.awaitModalSubmit({ time: 120000 })
          .then(async modalInteraction => {
            await modalInteraction.deferUpdate();

            if (modalInteraction.customId === 'destek-konu-modal') {
              const konu = modalInteraction.fields.getTextInputValue('konu-input');

              const kanal = await interaction.guild.channels.create({
                name: `destek-${i.user.username}`, 
                parent: '1249642791743651851',
                permissionOverwrites: [
                  {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                  },
                  {
                    id: i.user.id, 
                    allow: [PermissionFlagsBits.ViewChannel],
                  },
                ],
              });

              const row = new ActionRowBuilder()
                .addComponents(
                  new ButtonBuilder()
                    .setCustomId('kapat')
                    .setLabel('Talebi Kapat')
                    .setStyle(ButtonStyle.Danger),
                  new ButtonBuilder()
                    .setCustomId('yetkili')
                    .setLabel('Yetkili Çağır')
                    .setStyle(ButtonStyle.Secondary),
                );

              const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Destek Talebi Oluşturuldu')
                .setDescription(`**Konu:** ${konu}\n\nDestek ekibimiz en kısa sürede size yardımcı olacaktır.`)
                .setFooter({ text: 'Talebi kapatmak veya yetkili çağırmak için butonları kullanabilirsiniz.' });

              const mesaj = await kanal.send({ content: `${i.user}`, embeds: [embed], components: [row] }); // Butona tıklayan kişiyi etiketle

              const collector = mesaj.createMessageComponentCollector();

              collector.on('collect', async i => {
                if (i.customId === 'kapat') {
                  const row = new ActionRowBuilder()
                    .addComponents(
                      new ButtonBuilder()
                        .setCustomId('kapat-onay')
                        .setLabel('Evet, Kapat')
                        .setStyle(ButtonStyle.Danger),
                      new ButtonBuilder()
                        .setCustomId('kilitle')
                        .setLabel('Hayır, Kilitle')
                        .setStyle(ButtonStyle.Secondary),
                    );
              
                  const embed = new EmbedBuilder()
                    .setColor('Yellow')
                    .setTitle('Talebi Kapatma Onayı')
                    .setDescription('Destek talebini kapatmak istediğinize emin misiniz?');
              
                  await i.update({ embeds: [embed], components: [row] });
                } else if (i.customId === 'kapat-onay') {
                  await i.channel.delete();
                  await i.reply({ content: 'Destek talebiniz kapatıldı.', ephemeral: true });
                } else if (i.customId === 'kilitle') {
                  await i.update({ components: [] }); // Butonları kaldır
                  await i.channel.permissionOverwrites.edit(i.user.id, { SendMessages: false });
                  await i.followUp({ content: 'Destek talebiniz kilitlendi.', ephemeral: true });

                  // Embed'i güncelle
                  const kilitEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Destek Talebi (Kilitli)')
                    .setDescription(`**Konu:** ${konu}\n\nBu destek talebi kilitlenmiştir.`);
                  await mesaj.edit({ embeds: [kilitEmbed], components: [] }); // Butonları kaldır
                } else if (i.customId === 'yetkili') {
                  const yetkiliRolü = interaction.guild.roles.cache.get('1243206924724342879'); 
                  await i.channel.send({ content: `${yetkiliRolü}`, embeds: [new EmbedBuilder().setDescription('Yardımınıza ihtiyaç var!').setColor('Red')] });
                  await i.reply({ content: 'Yetkililer çağırıldı.', ephemeral: true });
                }
              });

              await modalInteraction.followUp({ content: 'Destek talebiniz oluşturuldu! <#' + kanal.id + '>', ephemeral: true });
            }
          })
          .catch(error => {
            console.error('Modal gönderilmedi veya zaman aşımına uğradı:', error);
            i.followUp({ content: 'Destek talebi oluşturulamadı. Lütfen daha sonra tekrar deneyin.', ephemeral: true });
          });
      }
    });
  },
};

