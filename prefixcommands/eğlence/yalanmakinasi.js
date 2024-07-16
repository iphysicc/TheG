module.exports = {
    name: "yalanmakinesi",
    aliases: ["ym", "yalan"],
    description: "Belirtilen kullanıcının yalan söyleyip söylemediğini tahmin eder.",
  
    async execute(message, args, client) {
      const options = ["Yalan söylüyor!", "Doğru söylüyor.", "Emin değilim.", "Büyük ihtimalle yalan.", "Kesinlikle doğru."];
  
      const member = message.mentions.members.first();
      if (!member) {
        return message.reply("Lütfen yalan makinesine sokmak istediğiniz kişiyi etiketleyin!");
      }
  
      const randomIndex = Math.floor(Math.random() * options.length);
      const result = options[randomIndex];
  
      const responseMessage = `${member.toString()} hakkında yalan makinesi ne diyor?\n\n**Cevap:** ${result}`;
      message.reply(responseMessage);
    },
  };
  