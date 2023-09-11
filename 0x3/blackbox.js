const axios = require('axios');

async function nero(event, api) {
  const userMessage = event.body;

  if (userMessage.length < 5 || containsEmojis(userMessage)) {
    const randomResponses = [
  'How can I assist you?',
  'What can I help you with?',
  'How can I be of service?',
  'Is there something I can do for you?',
  'I\'m here to assist you. How may I help?',
];
    const randomIndex = Math.floor(Math.random() * randomResponses.length);
    api.sendMessage(randomResponses[randomIndex], event.threadID, event.messageID);
    return;
  }

  const url = 'https://useblackbox.io/chat-request-v4';
  const data = {
    textInput: userMessage,
    allMessages: [{ user: userMessage }],
    stream: '',
    clickedContinue: false,
  };

  try {
    const response = await axios.post(url, data);
    const message = response.data.response[0][0];
    api.sendMessage(message, event.threadID, event.messageID);
  } catch (error) {
    api.sendMessage('An error occurred while fetching the response.', event.threadID, event.messageID);
  }
}

function containsEmojis(text) {
  const emojiPattern = /[\uD800-\uDFFF]./;
  return emojiPattern.test(text);
}

module.exports = nero;

