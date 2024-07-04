const Discord = require('discord.js');
const { JsonDatabase } = require("wio.db");
const { PermissionsBitField } = require('discord.js'); // Yetki bitlerini kullanmak için ekleyin

const spamCounts = new Map();
const maxMessages = 8;
const cooldownDuration = 60000;
const spamEngelDB = new JsonDatabase({
    databasePath: "./databases/spam_engel.json",
});

async function spamEngel(message) {
  const guildId = message.guild.id;
  const spamEngelEnabled = spamEngelDB.get(`spamEngel_${guildId}`) || false;
  if (!spamEngelEnabled) {
      return;
  }

  const me = message.guild.members.me;
  const timeoutPermission = PermissionsBitField.Flags.ModerateMembers;
  
  if (!me.permissions.has(timeoutPermission)) {
      console.log('Botun üyeleri susturma yetkisi yok.');
      return; 
  }

  const targetMember = message.member;
  if (targetMember.roles.highest.comparePositionTo(me.roles.highest) >= 0) {
      return;
  }

  let count = spamCounts.get(message.author.id) || 0;
  count++;
  spamCounts.set(message.author.id, count);

  if (count >= maxMessages) {
      try {
          await message.member.timeout(cooldownDuration, 'Spam nedeniyle timeout');
          await message.reply('Ard arda çok fazla mesaj gönderdiğin için 1 dakika boyunca susturuldun.');
      } catch (error) {
          if (error.code === 50013) {
              return;
          } else {
              console.error('Üyeyi sustururken beklenmedik bir hata oluştu:', error);
          }
      }

      spamCounts.delete(message.author.id);
  } else {
      setTimeout(() => {
          let currentCount = spamCounts.get(message.author.id) || 0;
          currentCount--;
          if (currentCount <= 0) {
              spamCounts.delete(message.author.id);
          } else {
              spamCounts.set(message.author.id, currentCount);
          }
      }, cooldownDuration);
  }
}

module.exports = spamEngel;
