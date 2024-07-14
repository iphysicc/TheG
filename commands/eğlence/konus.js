const axios = require("axios");
const fs = require("fs");
const path = require("path");
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
} = require("discord.js");

const MAX_RESPONSE_LENGTH = 2000;
const API_ENDPOINT = `https://msii.xyz/api/yapay-zeka?soru=`;
const MAX_BUTTONS_PER_ROW = 5;
const ALLOWED_CHANNEL_ID = "1262122365693722666";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("konuş")
    .setDescription("Yapay zeka ile konuşun.")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("Yapay zekaya sormak istediğiniz soru veya mesaj.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const prompt = interaction.options.getString("prompt");

    if (interaction.channel.id !== ALLOWED_CHANNEL_ID) {
      return interaction.reply({
        content: "Bu komutu sadece belirli bir kanalda kullanabilirsiniz.",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    try {
      const responses = await getMultipleResponses(prompt, 5);

      if (responses.some((response) => !response || response.trim() === "")) {
        await interaction.editReply("Yapay zeka geçerli bir yanıt üretemedi.");
        return;
      }

      if (responses.includes("@everyone") || responses.includes("@here")){
        return message.reply("Lütfen birilerini etiketleyici girdiler vermeyin!");
      }

      let currentResponseIndex = 0;
      const buttonRows = createButtonRows(
        responses.length,
        currentResponseIndex
      );

      const initialMessage = await interaction.editReply({
        content: responses[currentResponseIndex],
        components: buttonRows,
      });

      const filter = (i) => i.user.id === interaction.user.id;
      const collector = initialMessage.createMessageComponentCollector({
        filter,
        time: 120000,
      });

      collector.on("collect", async (i) => {
        let responseIndex = parseInt(i.customId.split("_")[1]);
        responseIndex = Math.min(
          Math.max(0, responseIndex),
          responses.length - 1
        );

        const selectedResponse = responses[responseIndex];
        if (!selectedResponse) {
          console.error(
            "Error: selectedResponse is undefined. responseIndex:",
            responseIndex
          );
          await i.update({
            content: "An error occurred. Please try again.",
            components: [],
          });
          return;
        }

        currentResponseIndex = responseIndex;

        if (selectedResponse.length > MAX_RESPONSE_LENGTH) {
          const filePath = path.join(
            __dirname,
            `response_${responseIndex}.txt`
          );
          fs.writeFileSync(filePath, selectedResponse);
          const attachment = new AttachmentBuilder(filePath);
          await i.update({
            files: [attachment],
            components: createButtonRows(
              responses.length,
              currentResponseIndex
            ),
          });
          fs.unlinkSync(filePath);
        } else {
          await i.update({
            content: selectedResponse,
            components: createButtonRows(
              responses.length,
              currentResponseIndex
            ),
          });
        }
      });
    } catch (error) {
      console.error("API isteği sırasında hata oluştu:", error);
      await interaction.editReply(
        "Bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
    }
  },
};

function createButtonRows(totalResponses, currentResponseIndex) {
  const rows = [];
  for (let i = 0; i < totalResponses; i++) {
    const rowIndex = Math.floor(i / MAX_BUTTONS_PER_ROW);
    if (!rows[rowIndex]) {
      rows[rowIndex] = new ActionRowBuilder();
    }

    rows[rowIndex].addComponents(
      new ButtonBuilder()
        .setCustomId(`response_${i}`)
        .setLabel(`${i + 1}`)
        .setStyle(
          i === currentResponseIndex ? ButtonStyle.Success : ButtonStyle.Primary
        )
    );
  }
  return rows;
}

async function getMultipleResponses(prompt, count) {
  const responses = await Promise.all(
    Array.from({ length: count }, () =>
      axios.get(`${API_ENDPOINT}${encodeURIComponent(prompt)}`)
    )
  );
  return responses.map((response) => response.data.reply);
}
