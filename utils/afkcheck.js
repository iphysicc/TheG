const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./databases/afk.json" }); 

function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const remainingSeconds = seconds % 60;
    const remainingMinutes = minutes % 60;

    let timeString = '';
    if (hours > 0) timeString += `${hours} saat `;
    if (minutes > 0) timeString += `${remainingMinutes} dakika `;
    if (seconds > 0) timeString += `${remainingSeconds} saniye`;

    return timeString.trim() || 'az önce';
}

module.exports = {
    handleAfkMentions: async (message) => {
        if (message.author.bot) return;

        const mentionedUsers = message.mentions.users;
        for (const user of mentionedUsers.values()) {
            const afkData = db.get(`afk_${user.id}`);
            if (afkData) {
                const timeSinceAfk = Date.now() - afkData.time;
                const timeString = formatTime(timeSinceAfk);
                message.reply(`${user.tag} kullanıcısı AFK, Sebep: ${afkData.reason} (AFK süresi: ${timeString})`);
            }
        }
    },

    handleAfkReturn: async (message) => {
        const authorAfkData = db.get(`afk_${message.author.id}`);
        if (authorAfkData) {
            db.delete(`afk_${message.author.id}`);
            try {
                await message.member.setNickname(message.member.displayName.replace('[AFK] ', ''));
            } catch (error) {
                console.error(error);
            }
            message.reply(`AFK modundan çıktınız, hoş geldiniz!`);
        }
    }
};
