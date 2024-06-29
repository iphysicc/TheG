const { AttachmentBuilder } = require('discord.js');
const { JsonDatabase } = require("wio.db");
const Canvas = require('canvas');
const axios = require('axios');
const path = require('path');

const db = new JsonDatabase({
    databasePath: "./databases/levels.json" 
});

module.exports = {
    name: 'seviye',
    cooldown: 10,
    aliases: ["seviye", "level"],
    description: 'Kullanıcının seviyesini gösterir.',
    async execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        const guildId = message.guild.id;
        const userId = user.id;

        let userLevel = db.get(`${guildId}-${userId}.level`) || 0;
        let userXp = db.get(`${guildId}-${userId}.xp`) || 0;

        let xpNeededForNextLevel = 5 * userLevel ** 2 + 50 * userLevel + 100;
        let remainingXp = xpNeededForNextLevel - userXp;

        const canvas = Canvas.createCanvas(900, 250);
        const ctx = canvas.getContext('2d');

        let backgroundURL = db.get(`${guildId}-${userId}.arkaPlan`) || null;
        let backgroundImage;
        if (backgroundURL) {
            try {
                const backgroundResponse = await axios.get(backgroundURL, { responseType: 'arraybuffer' });
                const backgroundBuffer = Buffer.from(backgroundResponse.data, 'binary');
                backgroundImage = await Canvas.loadImage(backgroundBuffer);
            } catch (error) {
                console.error("Arka plan resmi yüklenemedi:", error);
                backgroundImage = await Canvas.loadImage(path.join(__dirname, '../../assets/oppenheimer-imagination-v0-1680x1050.jpg')); 
            }
        } else {
            backgroundImage = await Canvas.loadImage(path.join(__dirname, '../../assets/oppenheimer-imagination-v0-1680x1050.jpg'));
        }
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        const xpRatio = Math.min(userXp / xpNeededForNextLevel, 1);
        ctx.fillStyle = '#7289DA';
        ctx.fillRect(40, 90, 500 * xpRatio, 50);

        ctx.font = '28px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${user.tag} - Seviye ${userLevel}`, 40, 60);
        ctx.fillText(`XP: ${userXp} / ${xpNeededForNextLevel}`, 40, 180);
        ctx.fillText(`Kalan XP: ${remainingXp}`, 40, 220);

        const avatarURL = user.displayAvatarURL({ extension: 'png' });
        const avatarResponse = await axios.get(avatarURL, { responseType: 'arraybuffer' });
        const avatarBuffer = Buffer.from(avatarResponse.data, 'binary');
        const avatarImage = await Canvas.loadImage(avatarBuffer);

        const avatarSize = 200;
        const avatarX = canvas.width - avatarSize - 40; 
        const avatarY = (canvas.height - avatarSize) / 2;
        ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), 'level.png');
        await message.reply({ files: [attachment] });
    },
};
