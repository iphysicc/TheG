const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const archiver = require('archiver');

module.exports = {
  cooldown: 120,
  data: new SlashCommandBuilder()
    .setName('twrpderle')
    .setDescription('Verilen recovery.img indirme linki için TWRP ağacı derler.')
    .addStringOption(option =>
      option.setName('link')
        .setDescription('Recovery.img dosyasının indirme linki')
        .setRequired(true)
    ),
  async execute(interaction) {
    const downloadLink = interaction.options.getString('link');

    await interaction.reply('TWRP ağacı derleniyor, lütfen bekleyin...');

    const outDir = path.join(__dirname, '../../twrp');

    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
    }

    const recoveryImgPath = path.join(outDir, 'recovery.img');

    try {
      const response = await fetch(downloadLink);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(recoveryImgPath, Buffer.from(buffer));
    } catch (error) {
      console.error('Dosya İndirme Hatası:', error);
      return interaction.followUp(`Dosya indirme hatası oluştu: ${error.message}`);
    }

    const command = `cd ${outDir} && python -m twrpdtgen recovery.img`;

    exec(command, async (error, stdout, stderr) => {
      if (error) {
        const errorEmbed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('Hata Oluştu')
          .setDescription(`\`\`\`${error.message}\`\`\``);
        await interaction.followUp({ embeds: [errorEmbed] });
      } else {
        const outputFiles = fs.readdirSync(outDir);
        if (outputFiles.length > 0) {
          const firstFile = outputFiles[0];
          const firstFilePath = path.join(outDir, firstFile);
          const zipPath = path.join(outDir, `${firstFile}.zip`);

          const output = fs.createWriteStream(zipPath);
          const archive = archiver('zip', { zlib: { level: 9 } });
          archive.pipe(output);

          if (fs.lstatSync(firstFilePath).isDirectory()) {
            archive.directory(firstFilePath, false);
          } else {
            archive.file(firstFilePath, { name: firstFile });
          }

          await archive.finalize();

          await interaction.followUp({ files: [zipPath] });
        } else {
          await interaction.followUp('Derleme sonucu bulunamadı.');
        }
      }

      fs.unlinkSync(recoveryImgPath);
      fs.rmSync(outDir, { recursive: true });
    });
  },
};
