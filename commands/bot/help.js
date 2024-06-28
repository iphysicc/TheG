const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yardım')
        .setDescription('Botun tüm komutlarını listeler.'),
    async execute(interaction) {
        const categories = {};

        const commandsPath = path.join(__dirname, '..'); 
        const commandFolders = fs.readdirSync(commandsPath).filter(folder => !folder.startsWith('.'));

        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(path.join(commandsPath, folder)).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const command = require(path.join(commandsPath, folder, file));

                if (command.data instanceof SlashCommandBuilder) { 
                    categories[folder] = categories[folder] || [];

                    if (command.data.options.length > 0) {
                        for (const subcommand of command.data.options.values()) {
                            categories[folder].push({
                                name: `${command.data.name} ${subcommand.name}`,
                                description: subcommand.description
                            });
                        }
                    } else {
                        categories[folder].push({
                            name: command.data.name,
                            description: command.data.description
                        });
                    }
                } 
            }
        }

        // 2. Create Select Menu
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('yardım-kategori')
            .setPlaceholder('Kategori Seçin');

        for (const category in categories) {
            selectMenu.addOptions({
                label: category,
                value: category
            });
        }

        // 3. Create Buttons
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Davet Et')
                    .setURL('https://discord.com/oauth2/authorize?client_id=752148017825447977&scope=bot&permissions=8')
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel('Web Sitesi')
                    .setURL('https://xtendproject.com.tr/')
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel('Sunucu')
                    .setURL('https://discord.gg/fDPvB4Jy55')
                    .setStyle(ButtonStyle.Link)
            );

        // 4. Initial Embed
        const initialCategory = Object.keys(categories)[0]; 
        const initialEmbed = createCategoryEmbed(categories[initialCategory], initialCategory);

        // 5. Send Initial Reply
        await interaction.reply({
            embeds: [initialEmbed],
            components: [new ActionRowBuilder().addComponents(selectMenu), row]
        });

        // 6. Handle Select Menu Interactions
        const filter = i => i.customId === 'yardım-kategori' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });

        collector.on('collect', async i => {
            const selectedCategory = i.values[0];
            const embed = createCategoryEmbed(categories[selectedCategory], selectedCategory);
            await i.update({ embeds: [embed] });
        });
    }
};

function createCategoryEmbed(commands, categoryName) {
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Komut Listesi - ${categoryName}`);

    embed.addFields({
        name: categoryName,
        value: commands.map(cmd => `**/${cmd.name}** - ${cmd.description}`).join('\n'),
        inline: false
    });
    return embed;
}
