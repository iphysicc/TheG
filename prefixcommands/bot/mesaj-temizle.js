const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "temizle",
    aliases: ["sil", "clear"], 
    description: "Belirtilen sayıda mesajı siler (en fazla 1000).",
    cooldown: 10,
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply("Mesajları silmek için `Mesajları Yönet` yetkisine sahip olmalısın.");
        }

        const sayi = parseInt(args[0]);
        const channel = message.channel;

        if (!sayi) {
            return message.reply("Lütfen silinecek mesaj sayısını belirtin (1-1000).");
        } else if (sayi > 1000) {
            return message.reply("En fazla 1000 mesaj silebilirim.");
        } else if (sayi < 1) {
            return message.reply("En az 1 mesaj silmeniz gerekir.");
        }

        let silinenMesajSayisi = 0;
        let lastMessageId = null;

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("Mesaj Temizleme")
            .setDescription(`Toplam ${sayi} mesaj silinecek. Lütfen bekleyin...`)
            .setTimestamp();

        await message.reply({ embeds: [embed] }); 

        while (silinenMesajSayisi < sayi) {
            const silinecekAdet = Math.min(sayi - silinenMesajSayisi, 100); 
            const mesajlar = await channel.messages.fetch({
                limit: silinecekAdet,
                before: lastMessageId,
            });

            if (mesajlar.size === 0) break;

            const silinenler = await channel.bulkDelete(mesajlar);
            silinenMesajSayisi += silinenler.size;
            lastMessageId = mesajlar.last().id;

            await new Promise((resolve) => setTimeout(resolve, 500)); 
        }

        const yeniMesaj = await message.channel.send({
            content: `${silinenMesajSayisi} mesaj silindi.`,
        });

        setTimeout(async () => {
            try {
                await yeniMesaj.delete();
            } catch (error) {
                console.error("Sonuç mesajı silinirken bir hata oluştu:", error);
            }
        }, 3000);
    },
};
