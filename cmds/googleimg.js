const google = require('googlethis');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function searchImages(event, api) {
  const input = event.body.toLowerCase().split(' ');

  if (input.includes('-help')) {
    const usage = "Usage: searchImages [query]\n\n" +
      "Description: Searches for images based on the specified query using Google and sends up to 6 images at once.\n\n" +
      "Example: searchImages The Wolf Among Us";
    api.sendMessage(usage, event.threadID);
    return;
  }

  const query = input.slice(1).join(' ');
  const options = {
    safe: false
  };

  try {
    api.sendMessage(`Searching for images related to "${query}". Please wait...`, event.threadID);

    const response = await google.image(query, options);
    const images = response.slice(0, 6);

    if (images.length > 0) {
      const downloadPromises = images.map((image, index) => {
        const imageUrl = image.url;
        const filePath = path.join(__dirname, '..', 'temp', `${query}_${index}.png`);
        return downloadFile(imageUrl, filePath);
      });

      await Promise.all(downloadPromises);

      const attachments = images.map((image, index) => {
        const filePath = path.join(__dirname, '..', 'temp', `${query}_${index}.png`);
        return fs.createReadStream(filePath);
      });

      api.sendMessage({
        body: `Here are the images for "${query}":`,
        attachment: attachments
      }, event.threadID).catch((err) => {
        console.error(`Error sending message: ${err}`);
      });
    } else {
      api.sendMessage('No images found for the specified query.', event.threadID).catch((err) => {
        console.error(`Error sending message: ${err}`);
      });
    }
  } catch (err) {
    console.error(`Error searching for images: ${err}`);
    api.sendMessage('Failed to search for images. Please try again later.', event.threadID).catch((err) => {
      console.error(`Error sending message: ${err}`);
    });
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

module.exports = searchImages;
