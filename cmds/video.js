const axios = require('axios');
const fs = require('fs');
const { Innertube, UniversalCache } = require('youtubei.js');

async function video(event, api) {
  const input = event.body;
  const data = input.split(" ");

  if (data.includes('-help')) {
    const usage = "Usage: music [song title]\n\n" +
      "Description: Searches and downloads video from YouTube. You can also include the -lyrics option to retrieve the lyrics along with the video.\n\n" +
      "Example: video Giga Chad Theme song\n" +
      "Example with lyrics: video -lyrics Yesterday by The Beatles\n\n" +
      "Note: The command expects a song title input.";
    api.sendMessage(usage, event.threadID);
    return;
  }

  const isLyricsIncluded = data.includes('-lyrics');
  const songTitle = isLyricsIncluded ? data.slice(2).join(" ") : data.slice(1).join(" ");

  if (songTitle.length === 0) {
    api.sendMessage(`⚠️ Invalid use of command!\n💡Usage: video [song title]\nExample: video Giga Chad Theme song`, event.threadID);
    return;
  }

  const yt = await Innertube.create({ cache: new UniversalCache(false), generate_session_locally: true });
  const search = await yt.music.search(songTitle, { type: 'video' });

  if (search.results[0] === undefined) {
    api.sendMessage("⚠️ Audio not found!", event.threadID, event.messageID);
    return;
  }

  api.sendMessage(`🔍 Searching for the video: ${songTitle}...`, event.threadID, event.messageID);

  // Get the info and stream the audio
  const info = await yt.getBasicInfo(search.results[0].id);
  const url = info.streaming_data?.formats[0].decipher(yt.session.player);
  const stream = await yt.download(search.results[0].id, {
    type: 'video+audio', // audio, video or video+audio
    quality: 'best', // best, bestefficiency, 144p, 240p, 480p, 720p and so on.
    format: 'mp4' // media container format 
  });

  // Write the stream to a file and calculate the download speed and time
  const file = fs.createWriteStream(`${__dirname}/../temp/video.mp4`);

  async function writeToStream(stream) {
    const startTime = Date.now();
    let bytesDownloaded = 0;

    for await (const chunk of stream) {
      await new Promise((resolve, reject) => {
        file.write(chunk, (error) => {
          if (error) {
            reject(error);
          } else {
            bytesDownloaded += chunk.length;
            resolve();
          }
        });
      });
    }

    const endTime = Date.now();
    const downloadTimeInSeconds = (endTime - startTime) / 1000;
    const downloadSpeedInMbps = (bytesDownloaded / downloadTimeInSeconds) / (1024 * 1024);

    return new Promise((resolve, reject) => {
      file.end((error) => {
        if (error) {
          reject(error);
        } else {
          resolve({ downloadTimeInSeconds, downloadSpeedInMbps });
        }
      });
    });
  }

  async function getLyrics(title) {
    return axios.get(`https://sampleapi-mraikero-01.vercel.app/get/lyrics?title=${title}`)
      .then(response => response.data.result)
      .catch(error => {
        console.error(error);
        return null;
      });
  }

  async function main() {
    const { downloadTimeInSeconds, downloadSpeedInMbps } = await writeToStream(stream);
    const fileSizeInMB = file.bytesWritten / (1024 * 1024);

    const messageBody = `📹 Download complete!\n\nFile size: ${fileSizeInMB.toFixed(2)} MB\nDownload speed: ${downloadSpeedInMbps.toFixed(2)} Mbps\nDownload duration: ${downloadTimeInSeconds.toFixed(2)} seconds`;

    if (isLyricsIncluded) {
      const lyricsData = await getLyrics(songTitle);
      if (lyricsData) {
        const lyricsMessage = `video Title "${lyricsData.s_title}" by ${lyricsData.s_artist}:\n\n${lyricsData.s_lyrics}`;

        api.sendMessage({
          body: `${lyricsMessage}`,
          attachment: fs.createReadStream(`${__dirname}/../temp/video.mp4`)
        }, event.threadID);
        return;
      }
    }

    const titleMessage = isLyricsIncluded ? '' : `Title: ${info.basic_info['title']}\n\n`;
    api.sendMessage({
      body: `${titleMessage}${messageBody}`,
      attachment: fs.createReadStream(`${__dirname}/../temp/video.mp4`)
    }, event.threadID, event.messageID);
  }

  main();
}

module.exports = video;
