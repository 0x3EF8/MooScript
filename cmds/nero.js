const axios = require('axios');

async function nero(event, api) {
  if (event.body.includes('-help')) {
    const usage = "Usage: nero [query]\n\n" +
      "Description: Engage the Nero AI with a question and receive an insightful response.\n\n" +
      "Example: nero What is the meaning of life?";
    api.sendMessage(usage, event.threadID);
    return;
  }

  const query = event.body.substring(6).trim();

  if (!query) {
    api.sendMessage("🤖 Nero: Please provide a question for Nero AI to answer.", event.threadID);
    return;
  }

  api.sendMessage("🤖 Nero is processing your question...", event.threadID, event.messageID);

  const url = 'https://useblackbox.io/chat-request-v4';
  const data = {
    textInput: query,
    allMessages: [{ user: query }],
    stream: '',
    clickedContinue: false,
  };

  try {
    const response = await axios.post(url, data);
    const message = response.data.response[0][0];
    api.sendMessage(`🤖 Nero: ${message}`, event.threadID, event.messageID);
  } catch (error) {
    api.sendMessage('🛠️ An error occurred while fetching the response from Nero AI.', event.threadID);
  }
}

module.exports = nero;
