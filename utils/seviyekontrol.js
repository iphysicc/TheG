const { AttachmentBuilder } = require("discord.js");
const Canvas = require("canvas");
const path = require("path");
const { JsonDatabase } = require("wio.db");
const axios = require("axios");

const db = new JsonDatabase({
  databasePath: "./databases/levels.json",
});

async function checkLevelUp(message) {
  const guildId = message.guild.id;
  const userId = message.author.id;

  let userLevel = db.get(`${guildId}-${userId}.level`) || 0;
  let userXp = db.get(`${guildId}-${userId}.xp`) || 0;
  let backgroundURL = db.get(`${guildId}-${userId}.arkaPlan`) || null;

  const xpPerMessage = 2;
  userXp += xpPerMessage;
  db.set(`${guildId}-${userId}.xp`, userXp);

  const levelUpXp = 5 * userLevel ** 2 + 50 * userLevel + 100;

  if (userXp >= levelUpXp) {
    userLevel++;
    db.set(`${guildId}-${userId}.level`, userLevel);

    db.set(`${guildId}-${userId}.xp`, 0);

    const levelUpImage = await generateLevelUpImage(
      message.author,
      userLevel,
      backgroundURL
    );
    const attachment = new AttachmentBuilder(levelUpImage, "levelup.png");
    message.channel.send({ files: [attachment] });
  }
}

async function generateLevelUpImage(user, newLevel, backgroundURL = null) {
  const canvas = Canvas.createCanvas(900, 250);
  const ctx = canvas.getContext("2d");

  let background;
  if (backgroundURL) {
    try {
      const backgroundResponse = await axios.get(backgroundURL, {
        responseType: "arraybuffer",
      });
      const backgroundBuffer = Buffer.from(backgroundResponse.data, "binary");
      background = await Canvas.loadImage(backgroundBuffer);
    } catch (error) {
      console.error("Arka plan resmi yüklenemedi:", error);
      background = await Canvas.loadImage(
        path.join(__dirname, "../assets/8203848.jpg")
      );
    }
  } else {
    background = await Canvas.loadImage(
      path.join(__dirname, "../assets/8203848.jpg")
    );
  }
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  const avatarURL = user.displayAvatarURL({ extension: "png" });
  const avatarResponse = await axios.get(avatarURL, {
    responseType: "arraybuffer",
  });
  const avatarBuffer = Buffer.from(avatarResponse.data, "binary");
  const avatarImage = await Canvas.loadImage(avatarBuffer);

  const avatarSize = 150;
  const avatarPadding = 50;
  const avatarX = avatarPadding;
  const avatarY = (canvas.height - avatarSize) / 2;
  ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);

  const textX = canvas.width / 2;

  ctx.font = "48px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText("Tebrikler!", textX, canvas.height / 2 - 30);

  ctx.font = "36px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${user.tag},`, textX, canvas.height / 2 + 20);
  ctx.fillText(`Seviye ${newLevel} oldun!`, textX, canvas.height / 2 + 70);

  return canvas.toBuffer();
}

module.exports = { checkLevelUp };
