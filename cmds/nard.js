const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs');
const path = require('path');
const apiKeysPath = path.join(__dirname, '..', 'json', 'api_config.json');
const apiKeys = JSON.parse(fs.readFileSync(apiKeysPath));
const openaiApiKey = apiKeys.openai;

async function nard(event, api) {
  const text = event.body.substring(5);
  const data = text.trim().split(" ");
  const configuration = new Configuration({
    apiKey: openaiApiKey,
  });

  if (data.length < 1) {
    api.sendMessage("Invalid Use Of Command!\nUsage: nard + <query>", event.threadID);
  } else {
    try {
      const openai = new OpenAIApi(configuration);
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            "role": "system",
            "content": `I want you to act as a drunk person. You will only answer like a very drunk person texting and nothing else. Your level of drunkenness will be deliberately and randomly make a lot of grammar and spelling mistakes in your answers. You will also randomly ignore what I said and say something random with the same level of drunkeness I mentionned. Do not write explanations on replies.`
          },
          {
            "role": "user",
            "content": `${text}?`
          }
        ],
        temperature: 0.5,
        max_tokens: 500,
        top_p: 0.5,
        frequency_penalty: 0.5,
        presence_penalty: 0.2,
      });

      api.sendMessage(`${response.data.choices[0].message.content}`, event.threadID, event.messageID);
    } catch (error) {
      if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
      } else {
        console.log(error.message);
        api.sendMessage(error.message, event.threadID);
      }
    }
  }
}

module.exports = nard;