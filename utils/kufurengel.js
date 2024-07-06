const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./databases/kufur_engel.json" });

async function küfürengel(message) {
    const guildId = message.guild.id;
    const küfürEngel = db.get(`küfürEngel_${guildId}`);

    if (küfürEngel && !message.member.permissions.has('Administrator')) {
        const küfürler = require("../wordlists/kufurengel.json");
        const kufurVar = küfürler.some(küfür => message.content.toLowerCase().includes(küfür));

        if (kufurVar) {
            try {
                await message.delete();
            } catch (error) {
                return; 
            }
        }
    }
}

module.exports = küfürengel;
