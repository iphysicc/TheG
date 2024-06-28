const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('destek')
    .setDescription('Destek talebi oluşturur.')
    .addStringOption(option => option.setName('konu').setDescription('Destek talebinizin konusu').setRequired(true)),
  async execute(interaction) {
    const konu = interaction.options.getString('konu');

    const guild = interaction.member?.guild;

    if (!guild) {
      await interaction.reply({ content: 'Bu komut sadece sunucularda kullanılabilir!', ephemeral: true });
      return;
    }

    const kanal = await guild.channels.create({
      name: `destek-${interaction.user.username}`,
      parent: '1249642791743651851',
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
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

    const mesaj = await kanal.send({ content: `${interaction.user}`, embeds: [embed], components: [row] });

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

    await interaction.reply({ content: 'Destek talebiniz oluşturuldu! <#' + kanal.id + '>', ephemeral: true });
  },
};

