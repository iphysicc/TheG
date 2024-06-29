const { Collection } = require("discord.js");
const { prefix } = require("../config.json");

async function prefixcommandcheck(message, client) {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.prefixcommands.get(commandName) 
        || client.prefixcommands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
    if (!command) return; 

    if (command.cooldown) {
        const cooldown = command.cooldown * 1000; 
        const now = Date.now();

        if (!client.cooldowns.has(command.name)) {
            client.cooldowns.set(command.name, new Collection());
        }

        const commandTimestamps = client.cooldowns.get(command.name);
        if (commandTimestamps.has(message.author.id)) {
            const expirationTime = commandTimestamps.get(message.author.id) + cooldown;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`Bu komutu tekrar kullanmak için ${timeLeft.toFixed(1)} saniye beklemelisin.`);
            }
        }
    
        commandTimestamps.set(message.author.id, now);
        setTimeout(() => commandTimestamps.delete(message.author.id), cooldown);
    }

    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error(error);
        await message.reply('Komut yürütülürken bir hata oluştu!');
    }
}

module.exports = prefixcommandcheck;
