const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('taşkağıtmakas')
    .setDescription('Taş Kağıt Makas oyna!')
    .addUserOption(option => option.setName('rakip').setDescription('Rakibin').setRequired(false)),

  async execute(interaction) {
    const opponent = interaction.options.getUser('rakip');

    if (opponent && (opponent.bot || opponent.id === interaction.user.id)) {
      return interaction.reply({ content: 'Geçerli bir kullanıcıyı etiketlemelisin!', ephemeral: true });
    }

    await interaction.deferReply();

    let userScore = 0;
    let opponentScore = 0;

    const playRound = async () => {
      const choices = ['taş', 'kağıt', 'makas'];
      const computerChoice = choices[Math.floor(Math.random() * 3)];

      const buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId('taş').setLabel('Taş').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('kağıt').setLabel('Kağıt').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId('makas').setLabel('Makas').setStyle(ButtonStyle.Danger)
        );

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Taş Kağıt Makas')
        .setDescription(`Skor:\n${interaction.user.username}: ${userScore}\n${opponent ? opponent.username : 'Bilgisayar'}: ${opponentScore}\n\nSeçimini yap!`);

      await interaction.editReply({ embeds: [embed], components: [buttons] });

      const filter = (i) => [interaction.user.id, opponent ? opponent.id : ''].includes(i.user.id);
      const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 15000 });

      collector.on('collect', async (i) => {
        const userChoice = i.customId;
        const opponentChoice = opponent ? (i.user.id === interaction.user.id ? computerChoice : userChoice) : computerChoice;

        let result = '';
        if (userChoice === opponentChoice) {
          result = 'Berabere!';
        } else if (
          (userChoice === 'taş' && opponentChoice === 'makas') ||
          (userChoice === 'kağıt' && opponentChoice === 'taş') ||
          (userChoice === 'makas' && opponentChoice === 'kağıt')
        ) {
          result = `${i.user.username} kazandı!`;
          if (i.user.id === interaction.user.id) userScore++;
          else opponentScore++;
        } else {
          result = `${i.user.id === interaction.user.id ? (opponent ? opponent.username : 'Bilgisayar') : interaction.user.username} kazandı!`;
          if (i.user.id === interaction.user.id) opponentScore++;
          else userScore++;
        }

        const resultEmbed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Taş Kağıt Makas')
          .setDescription(`Skor:\n${interaction.user.username}: ${userScore}\n${opponent ? opponent.username : 'Bilgisayar'}: ${opponentScore}\n\n${i.user.username}: ${userChoice}\n${opponent ? opponent.username : 'Bilgisayar'}: ${opponentChoice}\n\n${result}`);

        await i.update({ embeds: [resultEmbed], components: [] }); 

        await new Promise(resolve => setTimeout(resolve, 2000)); 

        collector.stop();

        if (userScore >= 3 || opponentScore >= 3) {
          const finalEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Taş Kağıt Makas')
            .setDescription(`Oyun bitti!\n\n${userScore >= 3 ? interaction.user.username : (opponent ? opponent.username : 'Bilgisayar')} kazandı!`);
          await interaction.editReply({ embeds: [finalEmbed], components: [] });
        } else {
          await playRound();
        }
      });

      collector.on('end', async (collected) => {
        if (collected.size === 0) {
          await interaction.editReply({ content: 'Süre doldu!', components: [] });
        }
      });
    };

    await playRound();
  },
};
