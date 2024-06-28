const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balonpatlat")
    .setDescription("Sürekli balon patlatma oyunu"),

  async execute(interaction) {
    const rows = 3;
    const cols = 5;
    let balloons = Array.from({ length: rows }, () => Array(cols).fill("🎈"));
    let score = 0;
    let timeLeft = 30;

    const resetGame = () => {
      balloons = Array.from({ length: rows }, () => Array(cols).fill("🎈"));
    };

    const updateEmbed = () => {
      return new EmbedBuilder()
        .setTitle("Balon Patlatma Oyunu")
        .setDescription(balloons.map((row) => row.join(" ")).join("\n"))
        .addFields(
          { name: "Skor", value: score.toString() },
          { name: "Süre", value: timeLeft.toString() + " saniye" }
        )
        .setColor(0x00ff00);
    };

    const createButtons = () => {
      const components = [];
      for (let i = 0; i < rows; i++) {
        const row = new ActionRowBuilder();
        for (let j = 0; j < cols; j++) {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`${i}-${j}`)
              .setLabel("🎈")
              .setStyle(ButtonStyle.Success)
          );
        }
        components.push(row);
      }
      return components;
    };

    const message = await interaction.reply({
      embeds: [updateEmbed()],
      components: createButtons(),
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30000,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) return;

      const [row, col] = i.customId.split("-").map(Number);
      if (balloons[row][col] === "💥") return;

      balloons[row][col] = "💥";
      score++;

      if (balloons.every((row) => row.every((cell) => cell === "💥"))) {
        resetGame();
      }

      await i.update({ embeds: [updateEmbed()], components: createButtons() });
    });

    const timerInterval = setInterval(async () => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        await message.edit({
          components: [],
          embeds: [updateEmbed().setDescription("Oyun Bitti!")],
        });
      } else {
        await message.edit({ embeds: [updateEmbed()] });
      }
    }, 1000);
  },
};
