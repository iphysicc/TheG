const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const commandhandler = require('./utils/commandhandler');
const eventhandler = require('./utils/eventhandler');

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
] });

client.cooldowns = new Collection();
client.commands = new Collection();

const handlers = [commandhandler, eventhandler];

for (const handler of handlers) {
    handler(client);
}

client.login(token);