const { Events, Collection } = require('discord.js');
const interactioncheck = require('../utils/interaction');
const { APIErrors } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            await interactioncheck(interaction);
        } catch (error) {
            if (error.code === APIErrors.UNKNOWN_INTERACTION) {
                console.error('Unknown Interaction hatası yakalandı:');
            } else {
                console.error('Başka bir hata:', error);
                throw error; 
            }
        }
    },
};
