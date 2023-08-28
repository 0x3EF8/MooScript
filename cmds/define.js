const google = require('googlethis');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function defineWord(event, api) {
  const input = event.body.toLowerCase().split(' ');

  if (input.includes('-help')) {
    const usage = "Usage: defineWord [word]\n\n" +
      "Description: Retrieves the definition of the specified word using Google Dictionary.\n\n" +
      "Example: defineWord amazing";
    api.sendMessage(usage, event.threadID);
    return;
  }

  const word = input[1];
  const options = {
    additional_params: {
      hl: 'en'
    }
  };

  try {
    const query = `define ${word}`;
    const response = await google.search(query, options);
    const dictionary = response.dictionary;

    if (dictionary) {
      let message = '';

      message += `Word: ${dictionary.word}\n`;
      message += `Phonetic: ${dictionary.phonetic}\n\n`;

      dictionary.definitions.forEach((definition, index) => {
        message += `Definition ${index + 1}: ${definition}\n`;
      });

      message += '\nExamples:\n';
      dictionary.examples.forEach((example, index) => {
        message += `Example ${index + 1}: ${example}\n`;
      });

      const audioUrl = dictionary.audio;
      if (audioUrl) {
        const audioPath = path.join(__dirname, '..', 'temp', `${word}.mp3`);
        await downloadFile(audioUrl, audioPath);
        const audioAttachment = fs.createReadStream(audioPath);
        api.sendMessage({
          body: message,
          attachment: audioAttachment
        }, event.threadID);
      } else {
        api.sendMessage(message, event.threadID);
      }
    } else {
      api.sendMessage('No definition found for the specified word.', event.threadID);
    }
  } catch (err) {
    console.error(`Error retrieving word definition: ${err}`);
    api.sendMessage('Failed to retrieve word definition. Please try again later.', event.threadID);
  }
}

async function downloadFile(url, outputPath) {
  const response = await axios.get(url, { responseType: 'stream' });
  const writer = fs.createWriteStream(outputPath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

module.exports = defineWord;
