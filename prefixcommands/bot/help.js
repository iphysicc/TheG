module.exports = {
  name: "yardım",
  cooldown: 10,
  description: "Komut kategorilerini ve komutları listeler.",
  async execute(message) {
   await message.reply("Ön ekli komutları kullanmayın. Yenilenmiş slash komutlar için `/yardım`");
  },
};