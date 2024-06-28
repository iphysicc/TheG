const { JsonDatabase } = require("wio.db");
const kufurengel = require("../commands/moderasyon/kufurengel.js");
const db = new JsonDatabase({ databasePath: "./databases/kufur_engel.json" });

async function küfürengel(message) {
    const guildId = message.guild.id;
    const küfürEngel = db.get(`küfürEngel_${guildId}`);

    if (küfürEngel && !message.member.permissions.has('Administrator')) { 
        const küfürler = ["am", "çük", "meme"]; //wordlisti siz ekleyeceksiniz.
        const kufurVar = küfürler.some(küfür => message.content.toLowerCase().includes(küfür));

        if (kufurVar) {
            await message.delete();
            await message.channel.send(`${message.author}, küfür etmek yasaktır!`);
        }
    }
}

module.exports = küfürengel;
