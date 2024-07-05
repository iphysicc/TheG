const axios = require('axios');

async function getApiResponse(prompt) {
  try {
    const response = await axios.get(`https://msii.xyz/api/yapay-zeka?soru=${encodeURIComponent(prompt)}`);
    return response.data.reply;
  } catch (error) {
    return 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
  }
}

async function handleMessage(message) {
  const userMessage = message.content;

  if (userMessage.startsWith('+konuş')) {
    const args = userMessage.slice('+konuş'.length).trim();
    if (args) {
      const prompt = `${args}`;
      const apiResponse = await getApiResponse(prompt);

      // Boş yanıt kontrolü:
      if (!apiResponse || apiResponse.trim() === '') {
        return message.reply('Yapay zeka geçerli bir yanıt üretemedi.');
      }

      // Yanıt uzunluğu kontrolü (API yanıtı için):
      if (apiResponse.length > 2000) {
        const warningMessage = 'Uyarı: API yanıtı 2000 karakteri aşıyor. Lütfen sorunuzu daha spesifik hale getirin.';
        return message.reply(warningMessage); 
      } else {
        return message.reply(apiResponse);
      }
    } else {
      return message.reply('Lütfen konuşmam için bir şeyler söyleyin.');
    }
  }
}

module.exports = {
  handleMessage
};
  