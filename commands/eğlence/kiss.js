const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const gif = "./assets/dcdd45bc02f89241babe4ab61ce69f01.gif";
const attachment = new AttachmentBuilder(gif);

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("öp")
    .setDescription("Bir kullanıcıyı öpün.")
    .addUserOption((option) =>
      option
        .setName("kullanıcı")
        .setDescription("Öpeceğiniz kullanıcı")
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("kullanıcı");

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle(`${interaction.user.username} ${user.username}'yi öptü!`)
      .setImage("attachment://dcdd45bc02f89241babe4ab61ce69f01.gif")
      .setTimestamp();

    await interaction.reply({ embeds: [embed], files: [attachment] });
  },
};
