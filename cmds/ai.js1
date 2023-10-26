const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs');
const path = require('path');
const apiKeysPath = path.join(__dirname, '..', 'json', 'api_config.json');
const apiKeys = JSON.parse(fs.readFileSync(apiKeysPath));
const openaiApiKey = apiKeys.openai;

async function ai(event, api) {
  const text = event.body.substring(3);
  const query = text.trim();
  const configuration = new Configuration({
    apiKey: openaiApiKey,
  });

  if (!query) {
    api.sendMessage("🤖 AI: Please provide a message for the AI to respond to.", event.threadID);
    return;
  }

  api.sendMessage("🤖 AI is thinking...", event.threadID);

  try {
    const openai = new OpenAIApi(configuration);
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          "role": "system",
          "content": `I want you to act as an academician. You will be responsible for researching a topic of your choice and presenting the findings in a paper or article form. Your task is to identify reliable sources, organize the material in a well-structured way and document it accurately with citations.`
        },
        {
          "role": "user",
          "content": `${query}?`
        }
      ],
      temperature: 0.5,
      max_tokens: 3000,
      top_p: 0.5,
      frequency_penalty: 0.5,
      presence_penalty: 0.2,
    });

    const assistantResponse = response.data.choices[0].message.content;
    api.sendMessage(`🤖 AI: ${assistantResponse}`, event.threadID, event.messageID);
  } catch (error) {
    console.error(error);
    api.sendMessage("🛠️ An error occurred while processing your request. Please try again later.", event.threadID, event.messageID);
  }
}

module.exports = ai;
