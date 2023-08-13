const google = require('googlethis');

async function translateText(event, api) {
  const input = event.body.toLowerCase().split(' ');

  if (input.includes('-help')) {
    const usage = "Usage: translateText [text] to [language]\n\n" +
      "Description: Translates the specified text to the specified language using Google Translate.\n\n" +
      "Example: translateText hello world to french";
    api.sendMessage(usage, event.threadID);
    return;
  }

  const text = input.slice(1, input.indexOf('to')).join(' ');
  const targetLanguage = input[input.indexOf('to') + 1];
  const options = {
    additional_params: {
      hl: 'en'
    }
  };

  try {
    const query = `translate ${text} to ${targetLanguage}`;
    const response = await google.search(query, options);
    const translation = response.translation;

    if (translation) {
      let message = '';

      message += `Source Language: ${translation.source_language}\n`;
      message += `Target Language: ${translation.target_language}\n`;
      message += `Source Text: ${translation.source_text}\n`;
      message += `Target Text: ${translation.target_text}\n`;

      api.sendMessage(message, event.threadID).catch((err) => {
        console.error(`Error sending message: ${err}`);
      });
    } else {
      api.sendMessage('No translation found for the specified text and language.', event.threadID).catch((err) => {
        console.error(`Error sending message: ${err}`);
      });
    }
  } catch (err) {
    console.error(`Error translating text: ${err}`);
    api.sendMessage('Failed to translate text. Please try again later.', event.threadID).catch((err) => {
      console.error(`Error sending message: ${err}`);
    });
  }
}

module.exports = translateText;
