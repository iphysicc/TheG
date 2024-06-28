const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { JsonDatabase } = require("wio.db");

const db = new JsonDatabase({ databasePath: "./databases/profil.json" });

const data = new SlashCommandBuilder()
    .setName('profil')
    .setDescription('Profilini ayarla veya görüntüle.')
    .addSubcommand(subcommand =>
        subcommand
            .setName('ayarla')
            .setDescription('Profilini ayarla.')
            .addStringOption(option =>
                option.setName('fotoğraf')
                .setDescription('Profil fotoğrafının URL\'sini girin.')
                .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('açıklama')
                .setDescription('Kendin hakkında kısa bir açıklama ekle.')
                .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('emojiler')
                .setDescription('En sevdiğin 3 emojiyi ekle (örnek: :smile: :heart: :sunglasses:)')
                .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('not')
                .setDescription('Kendinle ilgili bir not ekle.')
                .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('görüntüle')
            .setDescription('Profilini görüntüle.')
            .addUserOption(option =>
                option.setName('kullanıcı')
                .setDescription('Görüntülenecek kullanıcının etiketini girin.')
            )
    );

module.exports = {
    data: data,
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'ayarla') {
            const resimUrl = interaction.options.getString('fotoğraf');
            const açıklama = interaction.options.getString('açıklama') || 'Açıklama yok';
            const emojiler = interaction.options.getString('emojiler') || 'Emoji yok';
            const not = interaction.options.getString('not') || 'Not yok';

            db.set(interaction.user.id, { açıklama, emojiler, not, fotoğraf: resimUrl });

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`${interaction.user.username}'ın Profili`)
                .setThumbnail(resimUrl) // Thumbnail olarak kullan
                .setDescription(açıklama)
                .addFields(
                    { name: 'Emojiler 💖', value: emojiler, inline: true },
                    { name: 'Not 📝', value: not, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

            await interaction.reply({ embeds: [embed] }); // Sadece embed gönder
        } else if (subcommand === 'görüntüle') {
            const kullanıcı = interaction.options.getUser('kullanıcı') || interaction.user;

            const profil = db.get(kullanıcı.id);
            if (!profil) {
                return interaction.reply({ content: `${kullanıcı.username} kullanıcısının profili bulunamadı.`, ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`${kullanıcı.displayName}'ın Profili`)
                .setThumbnail(profil.fotoğraf) 
                .setDescription(profil.açıklama)
                .addFields(
                    { name: 'Emojiler 💖', value: profil.emojiler || 'Emoji yok', inline: true },
                    { name: 'Not 📝', value: profil.not || 'Not yok', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: kullanıcı.tag, iconURL: kullanıcı.displayAvatarURL() });

            await interaction.reply({ embeds: [embed] });
        }
    },
};
