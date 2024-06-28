const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botdurum')
        .setDescription('Botun durumunu gösterir.'),
    async execute(interaction) {
        const client = interaction.client;

        const uptime = formatUptime(client.uptime);
        const memoryUsage = formatMemoryUsage(process.memoryUsage().rss);
        const cpuUsage = os.loadavg()[0]; 
        const cpuModel = os.cpus()[0].model; // İşlemci modeli
        const totalMemory = formatMemoryUsage(os.totalmem()); // Toplam RAM miktarı

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Bot Durumu')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: 'Uptime', value: uptime, inline: true },
                { name: 'Bellek Kullanımı (RSS)', value: memoryUsage, inline: true },
                { name: 'CPU Kullanımı', value: `${cpuUsage.toFixed(2)}%`, inline: true },
                { name: 'İşlemci Modeli', value: cpuModel, inline: true },
                { name: 'Toplam RAM', value: totalMemory, inline: true },
                { name: 'Ping', value: `${client.ws.ping} ms`, inline: true },

            );

        await interaction.reply({ embeds: [embed] });
    }
};

function formatUptime(uptime) {
    const days = Math.floor(uptime / 86400000);
    const hours = Math.floor(uptime / 3600000) % 24;
    const minutes = Math.floor(uptime / 60000) % 60;
    const seconds = Math.floor(uptime / 1000) % 60;

    return `${days} gün, ${hours} saat, ${minutes} dakika, ${seconds} saniye`;
}

function formatMemoryUsage(bytes) {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}
