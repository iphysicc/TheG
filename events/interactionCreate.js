const { Events, Collection } = require('discord.js');
const interactioncheck = require('../utils/interaction');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        interactioncheck(interaction);   
  },
};