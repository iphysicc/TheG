const fs = require("fs");
const path = require("path");

async function prefixcommandhandler(client) {
    const commandsPath = path.join(__dirname, '../prefixcommands');
    const commandFolders = fs.readdirSync(commandsPath); 

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        const commandFiles = fs
            .readdirSync(folderPath)
            .filter((file) => file.endsWith(".js"));
        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const command = require(filePath);

            if ("name" in command && "execute" in command) {
                client.prefixcommands.set(command.name, command);
                if (command.aliases && Array.isArray(command.aliases)) {
                    command.aliases.forEach(alias => client.prefixcommands.set(alias, command));
                }
            } else {
                console.log(
                    `[UYARI] Komut ${file}, "name" veya "execute" özelliklerinden birine sahip değil.`
                );
            }
        }
    }
}
module.exports = prefixcommandhandler;
