const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs');
const path = require('path');
const apiKeysPath = path.join(__dirname, '..', 'json', 'api_config.json');
const apiKeys = JSON.parse(fs.readFileSync(apiKeysPath));
const openaiApiKey = apiKeys.openai;

async function textDavinci(event, api) {
  const configuration = new Configuration({
    apiKey: openaiApiKey,
  });

  let input = event.body.substring(3);
  let data = input.trim().split(" ");

  if (data.length < 2) {
    const messages = ["yes baby?", "yep?", "hello", "yup?", "sup?", "tangina bakit?"];
    const randomIndex = Math.floor(Math.random() * messages.length);
    api.sendMessage(messages[randomIndex], event.threadID, event.messageID);
  } else {
    try {
      const openai = new OpenAIApi(configuration);
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        prompt: `${input}`,
      });

      const response = completion.data.choices[0].text;
      api.sendMessage(response, event.threadID, event.messageID);
    } catch (error) {
      api.sendMessage(error.message, event.threadID);
      console.log(error);
    }
  }
}

module.exports = textDavinci;