const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function genFace(event, api) {
  const imagePath = path.join(__dirname, '../temp/genface.png');
  const url = "https://100k-faces.glitch.me/random-image";

  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream"
    });

    response.data.pipe(fs.createWriteStream(imagePath))
      .on("finish", async () => {
        const message = {
          body: "Here's your generated face:",
          attachment: fs.createReadStream(imagePath)
        };
        api.sendMessage(message, event.threadID, (error, info) => {
          if (error) {
            console.error(error);
          }
        });
      });
  } catch (error) {
    console.error(error);
    api.sendMessage("Sorry, I could not generate a face at this time. \nPlease try again later.", event.threadID, event.messageID);
  }
}

module.exports = genFace;
