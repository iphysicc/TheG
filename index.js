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

commandhandler(client);
eventhandler(client);

client.login(token);