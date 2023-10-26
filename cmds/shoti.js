const axios = require('axios');
const fs = require('fs');
const request = require('request');
let usedID;
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function shoti(event, api) {
  let bannedGC = [] //["9492786270746965"];
  if (!bannedGC.includes(event.threadID)) {
    const input = event.body.toLowerCase().split(' ');

    if (input.length > 1 && input[1] === '-help') {
      const usage = 'Usage: shoti\n\n' +
        'Description: Generates a random video clip using the Shoti API.\n\n' +
        'Example: shoti\n\n' +
        'Note: This command fetches a random video clip from the Shoti API and sends it as a message.';
      api.sendMessage(usage, event.threadID);
      return;
    }

    const apiUrl = 'https://shoti-api.libyzxy0.repl.co/api/get-shoti?apikey=shoti-1h72d5ggbqqnk4aj0sg';

    try {
      const response = await axios.get(apiUrl);
      const videoUrl = response.data.data.url;
      usedID = response.data.data.id;
      await new Promise((resolve, reject) => {
        request(videoUrl)
          .pipe(fs.createWriteStream(`${__dirname}/../temp/shoti.mp4`))
          .on('close', resolve)
          .on('error', reject);
      });

      await delay(1000);

      api.setMessageReaction("✅", event.messageID, (err) => { }, true);
      api.sendMessage({
        body: `@${response.data.user.username}`,
        attachment: fs.createReadStream(`${__dirname}/../temp/shoti.mp4`)
      }, event.threadID, event.messageID);
    } catch (error) {
      api.sendMessage(`An error occurred while generating the video. Error: ${error}`, event.threadID);
    }
  } else {
    api.sendMessage("This command is not allowed on this gc.", event.threadID, event.messageID);
  }
}
module.exports = shoti;
