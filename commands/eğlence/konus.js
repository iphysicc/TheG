const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');

const MAX_RESPONSE_LENGTH = 2000;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('konuş')
        .setDescription('Yapay zeka ile konuşun.')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('Yapay zekaya sormak istediğiniz soru veya mesaj.')
                .setRequired(true)
        ),
    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        await interaction.deferReply();

        try {
            const responses = await getMultipleResponses(prompt, 5);
            let currentResponseIndex = 0;

            const buttonRow = createButtonRow(responses, currentResponseIndex);
            const initialMessage = await interaction.editReply({
                content: responses[currentResponseIndex],
                components: [buttonRow]
            });

            const filter = (i) => i.user.id === interaction.user.id;
            const collector = initialMessage.createMessageComponentCollector({ filter });

            collector.on('collect', async (i) => {
                const responseIndex = parseInt(i.customId.split('_')[1]);
                currentResponseIndex = responseIndex;

                const selectedResponse = responses[responseIndex];
                if (selectedResponse.length > MAX_RESPONSE_LENGTH) {
                    const filePath = `response_${responseIndex}.txt`;
                    fs.writeFileSync(filePath, selectedResponse);
                    const attachment = new AttachmentBuilder(filePath);
                    await i.update({ files: [attachment], components: [createButtonRow(responses, currentResponseIndex)] });
                    fs.unlinkSync(filePath); // Dosyayı sil
                } else {
                    await i.update({ content: selectedResponse, components: [createButtonRow(responses, currentResponseIndex)] });
                }
            });
        } catch (error) {
            console.error('API isteği sırasında hata oluştu:', error);
            await interaction.editReply('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        }
    },
};

function createButtonRow(responses, currentResponseIndex) {
    const buttonRow = new ActionRowBuilder();
    for (let i = 0; i < responses.length; i++) {
        buttonRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`response_${i}`)
                .setLabel(`${i + 1}`)
                .setStyle(i === currentResponseIndex ? ButtonStyle.Success : ButtonStyle.Primary)
        );
    }
    return buttonRow;
}

async function getMultipleResponses(prompt, count) {
    const responses = await Promise.all(
        Array.from({ length: count }, () => axios.get(`https://msii.xyz/api/yapay-zeka?soru=${encodeURIComponent(prompt)}`))
    );
    return responses.map(response => response.data.reply);
}
