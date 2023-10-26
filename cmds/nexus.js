const axios = require('axios');

async function nexus(event, api) {
  if (event.body.includes('-help')) {
    const usage = "Usage: nexus [query]\n\n" +
      "Description: Engage the Nexus AI with a question and receive a response.\n\n" +
      "Example: nexus What is life?";
    api.sendMessage(usage, event.threadID);
    return;
  }

  const query = event.body.substring(6).trim();

  if (!query) {
    api.sendMessage("Please provide a question.", event.threadID);
    return;
  }

  const apiUrl = `https://herc-ai.onrender.com/v2/hercai?question=${encodeURIComponent(query)}`;

  axios.get(apiUrl)
    .then((response) => {
      const responseData = response.data;

      if (responseData && responseData.reply) {
        api.sendMessage(`${responseData.reply}`, event.threadID, (err, _) => {
          if (err) {
            console.error('Error sending Nexus response:', err);
          }
        });
      } else {
        api.sendMessage('Unable to retrieve a response at the moment.', event.threadID);
      }
    })
    .catch((error) => {
      console.error('Error fetching response from Nexus AI:', error);
      api.sendMessage('🛠️ An error occurred while fetching the response from Nexus AI.', event.threadID);
    });
}

module.exports = nexus;
