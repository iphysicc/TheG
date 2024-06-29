const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./databases/anonimmesajengel.json" });

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('anonimmesaj')
        .setDescription('Anonim mesaj gönderme ve engelleme işlemleri')
        .addSubcommand(subcommand =>
            subcommand
                .setName('gönder')
                .setDescription('Anonim mesaj gönder')
                .addStringOption(option => option.setName('mesaj').setDescription('Mesajınız').setRequired(true))
                .addUserOption(option => option.setName('kullanıcı').setDescription('Mesaj atacağınız kullanıcı').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('engelle')
                .setDescription('Anonim mesajları engelle/aç')
                .addBooleanOption(option => option.setName('durum').setDescription('Engellemek için "true", açmak için "false"').setRequired(true))
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const logKanali = "1251856323302391879"; 
        if (subcommand === 'gönder') {
            const mesaj = interaction.options.getString('mesaj');
            const user = interaction.options.getUser('kullanıcı');

            const engelliKullanicilar = db.get("engelliKullanicilar") || [];
            if (engelliKullanicilar.includes(user.id)) {
                return interaction.reply({ content: "Bu kullanıcı anonim mesajları engellemiş.", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle(`Biri size anonim mesaj gönderdi.`)
                .addFields({ name: 'Mesaj', value: mesaj })
                .setDescription("Gönderilen mesaj uygunsuz ise sunucu yöneticisine başvurun.");

            await interaction.reply({ content: "Mesaj başarıyla gönderildi.", ephemeral: true });
            await user.send({ embeds: [embed] });
            await interaction.guild.channels.cache.get(logKanali).send(`Biri anonim mesaj gönderdi. Gönderen: ${interaction.user.displayName} Gönderilen: ${user.displayName}`);
        } else if (subcommand === 'engelle') {
            const durum = interaction.options.getBoolean('durum');
            let engelliKullanicilar = db.get("engelliKullanicilar") || [];

            if (durum) {
                if (!engelliKullanicilar.includes(interaction.user.id)) {
                    engelliKullanicilar.push(interaction.user.id);
                    db.set("engelliKullanicilar", engelliKullanicilar);
                    await interaction.reply({ content: "Anonim mesajlar başarıyla engellendi.", ephemeral: true });
                } else {
                    await interaction.reply({ content: "Zaten anonim mesajları engellemişsiniz.", ephemeral: true });
                }
            } else {
                engelliKullanicilar = engelliKullanicilar.filter(id => id !== interaction.user.id);
                db.set("engelliKullanicilar", engelliKullanicilar);
                await interaction.reply({ content: "Anonim mesaj engeli başarıyla kaldırıldı.", ephemeral: true });
            }
        }
    },
};
