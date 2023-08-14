const axios = require('axios');

async function ai(event, api) {
  if (event.body.includes('-help')) {
    const usage = "Usage: ai [message]\n\n" +
      "Description: Engages in a conversation with the Advanced AI Assistant and retrieves a sophisticated response.\n\n" +
      "Example: ai Tell me about quantum physics.";
    api.sendMessage(usage, event.threadID);
    return;
  }

  const userMessage = event.body.substring(3).trim();

  if (!userMessage) {
    api.sendMessage("🤖 AI: Please provide a message for the AI to respond to.", event.threadID);
    return;
  }

  const apiUrl = `https://claude-unofficial-api.iampat404.repl.co/api/startConversation?message=${encodeURIComponent(userMessage)}`;

  api.sendMessage('🤖 AI is thinking...', event.threadID);

  try {
    const response = await axios.get(apiUrl);
    const assistantMessage = response.data.chat_messages.find(msg => msg.sender === 'assistant').text;

    if (assistantMessage) {
      api.sendMessage(`🤖 AI: ${assistantMessage}`, event.threadID, event.messageID);
    } else {
      api.sendMessage("🤖 AI: I'm sorry, but I couldn't generate a response for your query.", event.threadID, event.messageID);
    }
  } catch (error) {
    api.sendMessage("🛠️ An error occurred while processing your request. Please try again later.", event.threadID, event.messageID);
  }
}

module.exports = ai;
