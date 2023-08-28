const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function clone(event, api) {
  const input = event.body.split(' ');

  if (event.type === 'message_reply') {
    const messageReply = event.messageReply;
    const replyBody = messageReply.body;
    const urlRegex = /https?:\/\/pastebin.com\/raw\/[^\s]+/i;
    const match = replyBody.match(urlRegex);

    if (match) {
      const url = match[0];
      const [, filename] = input;

      try {
        const response = await axios.get(url);
        const filePath = path.join(__dirname, '.', `${filename}.js`);

        fs.writeFile(filePath, response.data, 'utf8', err => {
          if (err) {
            console.error(`Error writing file: ${err}`);
            api.sendMessage('Failed to create the new file. Please try again later.', event.threadID);
            return;
          }

          api.sendMessage(`The new file "${filename}.js" has been created successfully.`, event.threadID);
        });
      } catch (err) {
        console.error(`Error fetching Pastebin raw content: ${err}`);
        api.sendMessage('Failed to fetch the Pastebin raw content. Please check the URL and try again.', event.threadID);
      }
    } else {
      api.sendMessage('The reply message must contain a valid Pastebin raw URL.', event.threadID);
    }
  } else {
    const [, filename, url] = input;

    try {
      const response = await axios.get(url);
      const filePath = path.join(__dirname, '.', `${filename}.js`);

      fs.writeFile(filePath, response.data, 'utf8', err => {
        if (err) {
          console.error(`Error writing file: ${err}`);
          api.sendMessage('Failed to create the new file. Please try again later.', event.threadID);
          return;
        }

        api.sendMessage(`The new file "${filename}.js" has been created successfully.`, event.threadID);
      });
    } catch (err) {
      console.error(`Error fetching Pastebin raw content: ${err}`);
      api.sendMessage('Failed to fetch the Pastebin raw content. Please check the URL and try again.', event.threadID);
    }
  }
}

module.exports = clone;
