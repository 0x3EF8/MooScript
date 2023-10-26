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

  let input = event.body.substring(4);
  let data = input.trim().split(" ");

  if (data.length < 2) {
    const messages = [
  "Hello, how may I assist you?",
  "Yes, what can I help you with?",
  "Greetings!",
  "Certainly, how can I assist you?",
  "Hello, what's on your mind?",
  "May I inquire what you need assistance with?"
];
    const randomIndex = Math.floor(Math.random() * messages.length);
    api.sendMessage(messages[randomIndex], event.threadID, event.messageID);
  } else {
    try {
      const openai = new OpenAIApi(configuration);
      const completion = await openai.createCompletion({
        model: "text-davinci-002",
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