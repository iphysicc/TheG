const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { JsonDatabase } = require("wio.db");

const sikayetDB = new JsonDatabase({ databasePath: "./databases/sikayetler.json" });

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sikayetler')
    .setDescription('Şikayet sistemi komutları.')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .addSubcommand(subcommand =>
      subcommand
        .setName('gönder')
        .setDescription('Bir kullanıcı hakkında şikayette bulunun.')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('kanal-ayarla')
        .setDescription('Şikayetlerin gönderileceği kanalı ayarlar.')
        .addChannelOption(option => 
          option.setName('kanal')
            .setDescription('Şikayet kanalı olarak ayarlamak istediğiniz kanal')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('göster')
        .setDescription('Gönderilen şikayetleri gösterir.')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'gönder') {
      const modal = new ModalBuilder()
        .setCustomId('sikayetModal')
        .setTitle('Şikayet Formu');

      const sikayetEdilenInput = new TextInputBuilder()
        .setCustomId('sikayetEdilen')
        .setLabel('Şikayet Edilen Kullanıcı ID')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const sikayetInput = new TextInputBuilder()
        .setCustomId('sikayet')
        .setLabel('Şikayetinizi yazın')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const firstActionRow = new ActionRowBuilder().addComponents(sikayetEdilenInput);
      const secondActionRow = new ActionRowBuilder().addComponents(sikayetInput);

      modal.addComponents(firstActionRow, secondActionRow);

      await interaction.showModal(modal);

      const modalInteraction = await interaction.awaitModalSubmit({
        filter: i => i.customId === 'sikayetModal',
        time: 15_000
      }).catch(() => null);

      if (!modalInteraction) {
        return interaction.followUp({ content: 'Şikayet gönderme süresi doldu.', ephemeral: true });
      }

      const sikayetEdilenID = modalInteraction.fields.getTextInputValue('sikayetEdilen');
      const sikayet = modalInteraction.fields.getTextInputValue('sikayet');
      const tarihSaat = new Date().toLocaleString();

      const sikayetEdilen = interaction.guild.members.cache.get(sikayetEdilenID);
      if (!sikayetEdilen) {
        return modalInteraction.reply({ content: 'Geçersiz kullanıcı ID!', ephemeral: true });
      }

      const sikayetKanaliID = sikayetDB.get(`sikayetKanal_${interaction.guild.id}`);
      if (!sikayetKanaliID) {
        return modalInteraction.reply({ content: 'Şikayet kanalı ayarlanmamış!', ephemeral: true });
      }

      const sikayetKanali = interaction.guild.channels.cache.get(sikayetKanaliID);
      if (!sikayetKanali || sikayetKanali.type !== 0) { 
        return modalInteraction.reply({ content: 'Şikayet kanalı bulunamadı veya geçersiz!', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('Yeni Şikayet')
        .setDescription(`**Şikayet Eden:** ${interaction.user.tag} (\`${interaction.user.id}\`)\n**Şikayet Edilen:** ${sikayetEdilen.user.tag} (\`${sikayetEdilenID}\`)\n**Tarih & Saat:** ${tarihSaat}\n\n**Şikayet:**\n${sikayet}`)
        .setColor('Red');

      await sikayetKanali.send({ embeds: [embed] });
      await modalInteraction.reply({ content: 'Şikayetiniz başarıyla iletildi.', ephemeral: true });

      const sikayetler = sikayetDB.get(`sikayetler_${interaction.guild.id}`) || [];
      sikayetler.push({
        sikayetEden: interaction.user.id,
        sikayetEdilen: sikayetEdilenID,
        tarihSaat,
        sikayet
      });
      sikayetDB.set(`sikayetler_${interaction.guild.id}`, sikayetler);

    } else if (subcommand === 'kanal-ayarla') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: 'Bu komutu kullanmak için yönetici olmalısın!', ephemeral: true });
      }

      const kanal = interaction.options.getChannel('kanal');

      if (kanal.type !== 0) { 
        return interaction.reply({ content: 'Lütfen bir metin kanalı seçin.', ephemeral: true });
      }

      sikayetDB.set(`sikayetKanal_${interaction.guild.id}`, kanal.id);

      const embed = new EmbedBuilder()
        .setTitle('Şikayet Kanalı Ayarlandı')
        .setDescription(`Şikayetler artık <#${kanal.id}> kanalına gönderilecek.`)
        .setColor('Green');

      await interaction.reply({ embeds: [embed] });
    } else if (subcommand === 'göster') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: 'Bu komutu kullanmak için yönetici olmalısın!', ephemeral: true });
      }

      const sikayetler = sikayetDB.get(`sikayetler_${interaction.guild.id}`) || [];

      if (sikayetler.length === 0) {
        return interaction.reply({ content: 'Henüz hiç şikayet gönderilmemiş.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('Gönderilen Şikayetler')
        .setColor('Blue');

      for (const sikayet of sikayetler) {
        embed.addFields({
          name: `Şikayet Eden: ${sikayet.sikayetEden}`,
          value: `Şikayet Edilen: <@${sikayet.sikayetEdilen}>\nTarih: ${sikayet.tarihSaat}\nŞikayet: ${sikayet.sikayet}`
        });
      }

      await interaction.reply({ embeds: [embed] });
    }
  }
};
