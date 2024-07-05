const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./databases/sosyalkrediler.json" });
const logKanalID = "1258085488288596019";

db.math = function (key, operator, value, options) {
  const data = this.get(key) || 0;
  let result;

  if (operator === "+") result = data + value;
  else if (operator === "-") result = data - value;
  else if (operator === "*") result = data * value;
  else if (operator === "/") result = data / value;
  else if (operator === "%") result = data % value;
  else if (operator === "^") result = Math.pow(data, value);
  else throw new Error(`Unknown operator: ${operator}`);

  this.set(key, result);
  return result;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sosyalkredi")
    .setDescription("Sosyal kredi işlemleri")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("yükselt")
        .setDescription("Bir kullanıcının sosyal kredisini yükselt")
        .addUserOption((option) =>
          option.setName("kullanıcı").setDescription("Kredi yükseltilecek kullanıcı").setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("seviye")
            .setDescription("Kredi seviyesi")
            .setRequired(true)
            .addChoices(
              { name: "Yüksek", value: "yüksek" },
              { name: "Orta", value: "orta" },
              { name: "Düşük", value: "düşük" }
            )
        )
        .addStringOption((option) =>
          option.setName("url").setDescription("İyilik mesajının URL'si").setRequired(true)
        )
        .addAttachmentOption((option) =>
          option.setName("görsel").setDescription("İyilik mesajının ekran görüntüsü").setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("düşür")
        .setDescription("Bir kullanıcının sosyal kredisini düşür")
        .addUserOption((option) =>
          option.setName("kullanıcı").setDescription("Kredi düşürülecek kullanıcı").setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("seviye")
            .setDescription("Kredi seviyesi")
            .setRequired(true)
            .addChoices(
              { name: "Yüksek", value: "yüksek" },
              { name: "Orta", value: "orta" },
              { name: "Düşük", value: "düşük" }
            )
        )
        .addStringOption((option) =>
          option.setName("url").setDescription("Kötülük mesajının URL'si").setRequired(true)
        )
        .addAttachmentOption((option) =>
          option.setName("görsel").setDescription("Kötülük mesajının ekran görüntüsü").setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("sil")
        .setDescription("Bir kullanıcının sosyal kredisini sil (YETKİLİ)")
        .addUserOption((option) =>
          option.setName("kullanıcı").setDescription("Kredi silinecek kullanıcı").setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("göster")
        .setDescription("Belirtilen kullanıcının sosyal kredisini göster")
        .addUserOption((option) =>
          option.setName("kullanıcı").setDescription("Kredisi gösterilecek kullanıcı").setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("sıralama").setDescription("Sosyal kredi sıralamasını göster")
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser("kullanıcı");

    if (subcommand === "yükselt" || subcommand === "düşür") {
      const seviye = interaction.options.getString("seviye");
      const krediDeğeri = subcommand === "yükselt" ? (seviye === "yüksek" ? 5 : seviye === "orta" ? 3 : 1) : (seviye === "yüksek" ? -5 : seviye === "orta" ? -3 : -1);
      const url = interaction.options.getString("url");
      const görsel = interaction.options.getAttachment("görsel");

      db.add(user.id.toString(), krediDeğeri); 

      const embed = new EmbedBuilder()
        .setColor(subcommand === "yükselt" ? "#0099ff" : "#ff0000")
        .setTitle(`Sosyal Kredi ${subcommand === "yükselt" ? "Yükseltildi" : "Düşürüldü"}`)
        .setDescription(`${user} kullanıcısının sosyal kredisi ${krediDeğeri} ${subcommand === "yükselt" ? "arttırıldı" : "azaltıldı"}.`)
        .setImage(görsel.url)
        .setURL(url);

      await interaction.reply({ embeds: [embed] });

      const logKanal = interaction.guild.channels.cache.get(logKanalID);
      if (logKanal) {
        const logEmbed = new EmbedBuilder()
          .setColor(subcommand === "yükselt" ? "#0099ff" : "#ff0000")
          .setTitle("Sosyal Kredi Log")
          .setDescription(`${interaction.user} kullanıcısı ${user} kullanıcısının sosyal kredisini ${krediDeğeri} ${subcommand === "yükselt" ? "arttırdı" : "azalttı"}.`)
          .setImage(görsel.url)
          .setURL(url);
        await logKanal.send({ embeds: [logEmbed] });
      }
    } else if (subcommand === "sil") {
      if (!interaction.member.permissions.has("ADMINISTRATOR")) {
        return interaction.reply({ content: "Bu komutu kullanmak için yetkin yok!", ephemeral: true });
      }
      db.delete(user.id.toString());
      const embed = new EmbedBuilder().setColor("#ff0000").setTitle("Sosyal Kredi Silindi").setDescription(`${user} kullanıcısının sosyal kredisi silindi.`);
      await interaction.reply({ embeds: [embed] });
    } else if (subcommand === "göster") {
      const kredi = db.get(user.id.toString()) || 0;

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`${user.tag} kullanıcısının sosyal kredisi`)
        .setDescription(`**Kredi:** ${kredi}`);

      await interaction.reply({ embeds: [embed] });
    } else if (subcommand === "sıralama") {
      const siralama = db.all().sort((a, b) => b.data - a.data); 

      const embed = new EmbedBuilder().setColor("#0099ff").setTitle("Sosyal Kredi Sıralaması");

      for (let i = 0; i < Math.min(siralama.length, 10); i++) {
        const { ID: userID, data: kredi } = siralama[i];

        try {
          const user = await interaction.client.users.fetch(userID); 
          embed.addFields({ name: `${i + 1}. ${user.tag}`, value: `Kredi: ${kredi}`, inline: false });
        } catch (error) {
          if (error.code === 10013) {
            console.error(`Kullanıcı bulunamadı (ID: ${userID})`);
            db.delete(userID);
          } else {
            console.error("Sıralama sırasında hata:", error);
          }
        }
      }

      if (embed.data.fields && embed.data.fields.length > 0) {
        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply({
          content: "Henüz sosyal kredi sıralaması oluşturulamadı",
          ephemeral: true
        });
      }
    }
  },
};
