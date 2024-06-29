const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");

const activeGames = new Map();

module.exports = {
  cooldown: 20,
  data: new SlashCommandBuilder()
    .setName("yılan")
    .setDescription("Butonlarla oynanan yılan oyunu"),

  async execute(interaction) {
    if (activeGames.has(interaction.user.id)) {
      return interaction.reply({
        content: "Zaten bir oyununuz devam ediyor!",
        ephemeral: true,
      });
    }

    const gameData = {
      snake: [{ x: 5, y: 5 }],
      food: { x: 10, y: 5 },
      score: 0,
      direction: "right",
      gameOver: false,
      gameBoard: Array.from({ length: 11 }, () => Array(11).fill("⬛")),
      gameInterval: null,
    };
    activeGames.set(interaction.user.id, gameData);

    const updateGameBoard = () => {
        gameData.gameBoard.forEach(row => row.fill('⬛'));
        gameData.snake.forEach((segment, index) => {
            gameData.gameBoard[segment.y][segment.x] = index === 0 ? '<:wada:1254397454791606294>' : '🟩'; 
        });
        gameData.gameBoard[gameData.food.y][gameData.food.x] = '🍎';
    };

    const createEmbed = () => {
      return new EmbedBuilder()
        .setTitle("Yılan Oyunu")
        .setDescription(
          gameData.gameBoard.map((row) => row.join("")).join("\n")
        )
        .addFields({ name: "Skor", value: gameData.score.toString() })
        .setColor(gameData.gameOver ? 0xff0000 : 0x00ff00);
    };

    const createButtons = () => {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("up")
          .setLabel("⬆️")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("down")
          .setLabel("⬇️")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("left")
          .setLabel("⬅️")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("right")
          .setLabel("➡️")
          .setStyle(ButtonStyle.Primary)
      );
    };

    const moveSnake = async () => {
      const head = { x: gameData.snake[0].x, y: gameData.snake[0].y };

      switch (gameData.direction) {
        case "up":
          head.y--;
          break;
        case "left":
          head.x--;
          break;
        case "down":
          head.y++;
          break;
        case "right":
          head.x++;
          break;
      }

      if (head.x < 0 || head.x >= 11 || head.y < 0 || head.y >= 11) {
        gameData.gameOver = true;
      } else {
        gameData.snake.unshift(head);

        if (head.x === gameData.food.x && head.y === gameData.food.y) {
          gameData.score++;
          do {
            gameData.food = {
              x: Math.floor(Math.random() * 11),
              y: Math.floor(Math.random() * 11),
            };
          } while (
            gameData.snake.some(
              (segment) =>
                segment.x === gameData.food.x && segment.y === gameData.food.y
            )
          );
        } else {
          gameData.snake.pop();
        }

        gameData.gameOver =
          gameData.snake.some(
            (segment, index) =>
              index > 0 && segment.x === head.x && segment.y === head.y
          ) || gameData.gameOver;
      }
      if (gameData.gameOver) {
        clearInterval(gameData.gameInterval);
        activeGames.delete(interaction.user.id);
        await message.edit({ components: [] });
      } else {
        updateGameBoard();
        await message.edit({ embeds: [createEmbed()] });
      }
    };

    updateGameBoard();
    let message = await interaction.reply({
      embeds: [createEmbed()],
      components: [createButtons()],
    });

    gameData.gameInterval = setInterval(moveSnake, 500);
    let lastButtonInteraction = 0;

    const handleButtonInteraction = async (buttonInteraction) => {
      if (buttonInteraction.user.id !== interaction.user.id) return;

      const now = Date.now();
      if (now - lastButtonInteraction < 250) {
        return;
      }
      lastButtonInteraction = now;

      gameData.direction = buttonInteraction.customId;

      clearInterval(gameData.gameInterval);
      gameData.gameInterval = setInterval(moveSnake, 500);

      await buttonInteraction.deferUpdate();
    };

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 600000,
    });
    collector.on("collect", handleButtonInteraction);
    collector.on("end", () => {
      clearInterval(gameData.gameInterval);
      activeGames.delete(interaction.user.id);
    });
  },
};
