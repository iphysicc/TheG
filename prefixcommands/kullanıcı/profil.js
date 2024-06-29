const { EmbedBuilder } = require('discord.js');
const { JsonDatabase } = require("wio.db");

const db = new JsonDatabase({ databasePath: "./databases/profil.json" });

module.exports = {
    name: 'profil',
    description: 'Belirtilen kullanıcının profilini görüntüler.',
    async execute(message, args) {
        const targetUser = message.mentions.users.first() || message.author; 
        
        const profil = db.get(targetUser.id);
        if (!profil) {
            return message.reply(`${targetUser.username} kullanıcısının profili bulunamadı. Profil oluşturmak için \`/profil ayarla\` komutunu kullanın.`);
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`${targetUser.username}'ın Profili`)
            .setThumbnail(profil.fotoğraf)
            .setDescription(profil.açıklama)
            .addFields(
                { name: 'Emojiler 💖', value: profil.emojiler || 'Emoji yok', inline: true },
                { name: 'Not 📝', value: profil.not || 'Not yok', inline: true }
            )
            .setTimestamp()
            .setFooter({ text: targetUser.tag, iconURL: targetUser.displayAvatarURL() });

        await message.reply({ embeds: [embed] });
        await message.channel.send("Profil mesajlarını düzenlemek için slash komutları kullanmanız gerekli. `/yardım`")
    },
};
