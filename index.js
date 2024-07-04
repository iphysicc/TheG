const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");
const commandhandler = require("./utils/commandhandler");
const eventhandler = require("./utils/eventhandler");
const prefixcommandhandler = require("./utils/prefixcommandshandler");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

client.cooldowns = new Collection();
client.commands = new Collection();
client.prefixcommands = new Collection();

commandhandler(client);
eventhandler(client);
prefixcommandhandler(client);

client.login(token);
