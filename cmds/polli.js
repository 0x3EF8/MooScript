const fs = require('fs');
const axios = require('axios');
const path = require('path');

async function polli(event, api) {
  const input = event.body.toLowerCase().trim();

  if (input.includes('-help')) {
    const usage = "Usage: polli [prompt]\n\n" +
      "Description: Generates an image based on the provided prompt using Pollinations AI and sends it to you.\n\n" +
      "Example: polli cute japanese girl";
    api.sendMessage(usage, event.threadID);
    return;
  }

  const prompt = input.slice(6);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

  try {
    api.sendMessage('🌼 Generating image...\nPlease wait while I process your request.', event.threadID);
    const imageBuffer = await downloadImage(imageUrl);
    const imagePath = path.join(__dirname, '../temp/polliimg.png');

    fs.writeFileSync(imagePath, imageBuffer);

    const message = {
      body: 'Here is the image you requested:',
      attachment: fs.createReadStream(imagePath)
    };
    api.sendMessage(message, event.threadID, event.messageID);
  } catch (error) {
    console.error(error);
    api.sendMessage('🛠️ An error occurred while processing your request. Please try again later.', event.threadID, event.messageID);
  }
}

async function downloadImage(imageUrl) {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    return response.data;
  } catch (error) {
    throw new Error('Error downloading image');
  }
}

module.exports = polli;
