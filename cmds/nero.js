const axios = require('axios');

async function nero(event, api) {
  if (event.body.includes('-help')) {
    const usage = "Usage: nero [query]\n\n" +
      "Description: Asks a question to the Nero AI and retrieves the response.\n\n" +
      "Example: nero How does photosynthesis work?";
    api.sendMessage(usage, event.threadID);
    return;
  }

  const query = event.body.substring(6).trim();
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
    api.sendMessage(message, event.threadID);
  } catch (error) {
    api.sendMessage('An error occurred while fetching the response.', event.threadID);
  }
}

module.exports = nero;
