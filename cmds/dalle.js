const fs = require('fs');
const https = require('https');
const {
  Configuration,
  OpenAIApi
} = require("openai");
const path = require('path');
const apiKeysPath = path.join(__dirname, '..', 'json', 'api_config.json');
const apiKeys = JSON.parse(fs.readFileSync(apiKeysPath));
const openaiApiKey = apiKeys.openai;


async function dalle(event, api) {
  const input = event.body.toLowerCase().trim();

  if (input.includes("-help")) {
    const usage = "Usage: dalle [prompt]\n\n" +
      "Description: Generates an image based on the provided prompt.\n\n" +
      "Example: dalle Generate a beautiful landscape\n\n" +
      "Note: The command expects a prompt input.";
    api.sendMessage(usage, event.threadID);
    return;
  }

  const prompt = input.slice(6);
  const configuration = new Configuration({
    apiKey: openaiApiKey,
  });
  const openai = new OpenAIApi(configuration);

  try {
    api.sendMessage("Generating image...\nPlease wait while I process your request.", event.threadID, event.messageID);
    const response = await openai.createImage({
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });
    const image_url = response.data.data[0].url;
    const imagePath = path.join(__dirname, '../temp/genimg.jpg');

    https.get(image_url, (linkResponse) => {
      const fileStream = fs.createWriteStream(imagePath);
      linkResponse.pipe(fileStream);
      fileStream.on('finish', () => {
        console.log("Image saved!");
        var message = {
          body: "Your image is ready!",
          attachment: fs.createReadStream(imagePath)
        };
        api.sendMessage(message, event.threadID, event.messageID);
      });
    });
  } catch (error) {
    console.log(error);
    api.sendMessage("Sorry, I could not generate an image at this time.\nPlease try again later.", event.threadID, event.messageID);
  }
}

module.exports = dalle;
