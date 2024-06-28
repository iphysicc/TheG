const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./databases/reklam_engel.json" });

async function reklamengel(message) {
    const guildId = message.guild.id;
    const reklamEngel = db.get(`reklamEngel_${guildId}`);

    if (reklamEngel) {
        const reklamRegex = /(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?/g; 
        const reklamKeywords = ["discord.gg", "invite.gg", "top.gg"]; // Reklam anahtar kelimeleri siz ekleyin yine

        if (reklamRegex.test(message.content) || reklamKeywords.some(keyword => message.content.includes(keyword))) {
            await message.delete();
            await message.channel.send(`${message.author}, reklam yapmak yasaktır!`);
        }
    }
}

module.exports = reklamengel;