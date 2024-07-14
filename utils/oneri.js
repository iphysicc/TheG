async function oneri(message) {
    const kanalID = '1262149180479242299';

    if (message.channelId === kanalID) {
      try {
        await message.react('✅');
        await message.react('❌');
      } catch (error) {
        console.error('Tepki eklenirken hata oluştu:', error);
      }
    }
}

module.exports = oneri;
