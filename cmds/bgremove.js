const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const request = require('request');
const path = require('path');
const apiKeysPath = path.join(__dirname, '..', 'json', 'api_config.json');
const apiKeys = JSON.parse(fs.readFileSync(apiKeysPath));
const rembgApiKey = apiKeys.rembg;

async function removeBackground(event, api) {
  const { threadID, messageID, type, messageReply } = event;

  if (type !== 'message_reply') {
    api.sendMessage('[ERR] Invalid usage. Please reply to an image message.', threadID, messageID);
    return;
  }

  if (messageReply.attachments.length !== 1 || messageReply.attachments[0].type !== 'photo') {
    api.sendMessage('[ERR] Invalid image. Please reply to a single photo.', threadID, messageID);
    return;
  }

  const url = messageReply.attachments[0].url;
  const inputPath = path.join(__dirname, '..', 'temp', `removebg.png`);

  request(url)
    .pipe(fs.createWriteStream(inputPath))
    .on('finish', () => {
      const formData = new FormData();
      formData.append('size', 'auto');
      formData.append('image_file', fs.createReadStream(inputPath), path.basename(inputPath));

      axios({
        method: 'post',
        url: 'https://api.remove.bg/v1.0/removebg',
        data: formData,
        responseType: 'arraybuffer',
        headers: {
          ...formData.getHeaders(),
          'X-Api-Key': rembgApiKey,
        },
        encoding: null,
      })
        .then((res) => {
          if (res.status !== 200) {
            console.error('Error:', res.status, res.statusText);
            return;
          }

          fs.writeFileSync(inputPath, res.data);

          const message = {
            body: 'Successfully removed the background.',
            attachment: fs.createReadStream(inputPath),
          };

          api.sendMessage(message, threadID, messageID);
        })
        .catch((error) => {
          api.sendMessage('[ERR] Request Failed\n\n' + error, threadID, messageID);
          console.error('Request failed:', error);
        });
    });
}

module.exports = removeBackground;
