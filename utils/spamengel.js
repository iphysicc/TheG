const { Collection } = require('discord.js');
const { JsonDatabase } = require("wio.db");

const spamEngelDB = new JsonDatabase({ databasePath: "./databases/spam_engel.json" });
const spamCooldown = new Collection();

async function spamengel(message) {
    const guildId = message.guild.id;
    const spamEngel = spamEngelDB.get(`spamEngel_${guildId}`);

    if (spamEngel && !message.member.permissions.has('Administrator')) {
        const userId = message.author.id;
        const cooldownAmount = 1 * 60 * 1000; 

        if (spamCooldown.has(userId)) {
            const expirationTime = spamCooldown.get(userId) + cooldownAmount;
            if (Date.now() < expirationTime) {
                return; 
            }
        }

        const messages = await message.channel.messages.fetch({ limit: 5 });
        const userMessages = messages.filter(msg => msg.author.id === userId);

        if (userMessages.size >= 5) {
            try {
                await message.member.timeout(cooldownAmount, 'Spam yapmak');
                await message.channel.send(`${message.author}, spam yaptığınız için 1 dakika susturuldunuz.`);
            } catch (error) {
                console.error('Timeout atma hatası:', error);
            }

            spamCooldown.set(userId, Date.now()); 
            setTimeout(() => {
                spamCooldown.delete(userId); 
            }, cooldownAmount);
        }
    }
}

module.exports = spamengel;
