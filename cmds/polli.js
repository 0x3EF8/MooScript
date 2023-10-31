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
  const basePrompt = input.slice(6);
  const prompt = await randomizer(basePrompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=-1&nologo=true`;

  try {
    api.sendMessage('🌼 Generating image...\nPlease wait while I process your request.', event.threadID);
    const imageBuffer = await downloadImage(imageUrl);
    const imagePath = path.join(__dirname, `../temp/polliimg${prompt.replace(basePrompt, "")}.png`);

    fs.writeFileSync(imagePath, imageBuffer);

    const message = {
      body: 'Here is the image you requested:',
      attachment: fs.createReadStream(imagePath)
    };
    api.sendMessage(message, event.threadID, () => fs.unlinkSync(imagePath), event.messageID);
  } catch (error) {
    console.error(error);
    api.sendMessage('🛠️ An error occurred while processing your request. Please try again later.', event.threadID, event.messageID);
  }
}

function randomizer(prompt) {
  let randNum = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
  let newPrompt = prompt.concat("%", randNum);
  return newPrompt;
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
