const { easyEmbed } = require("../../utils/easyEmbed.js");

module.exports = {
  name: "yardım",
  description: "Komut kategorilerini ve komutları listeler.",

  async execute(message) {
    easyEmbed(
      null,
      "Ön ekli komutları kullanmayın. Yenilenmiş slash komutlar için `/yardım`",
      message
    );
  },
};
