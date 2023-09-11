const fs = require('fs');
const https = require('https');
const path = require('path');
const google = require("googlethis");

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const FILE_SEND_DELAY = 5000; 

async function fileSearch(query, fileType) {
  let result = await google.search(query + " " + fileType, {
    safe: true,
  });
  return result;
}

async function getFile(event, api) {
  const input = event.body.toLowerCase();
  const data = input.split(" ");

  if (data.length > 1 && data[1] === '-help') {
    const usage = "Usage: getFile [file type] [search query]\n\n" +
      "Description: Performs a file search on the web based on the specified file type and search query.\n\n" +
      "Example: getFile pdf openai documentation\n\n" +
      "Note: The command will download the first matching file found and send it as an attachment.";
    api.sendMessage(usage, event.threadID);
    return;
  }

  if (data.length < 3) {
    api.sendMessage(`Invalid command format. Usage: getFile [file type] [search query]`, event.threadID, event.messageID);
  } else {
    let fileType = data[1];
    data.shift();
    data.shift();
    let query = data.join(" ");
    api.sendMessage(`⏳ Please standby for 5 seconds while the system conducts a file search.`, event.threadID, event.messageID);
    (async () => {
      let searchResult = await fileSearch(query, fileType).catch((e) => {
        console.log(e);
        return null;
      });
      if (searchResult) {
        let results = searchResult.results;
        let found = false;
        let count = 0;
        for (let i = 0; i < results.length; i++) {
          let title = results[i].title.replace(/[\\/:"*?<>|]/gi, "_"); 
          if (results[i] !== undefined && results[i].url.includes("." + fileType)) {
            let file = fs.createWriteStream(path.join(__dirname, '../temp/', title + '.' + fileType));
            let name = `${__dirname}/../temp/${title}.${fileType}`; 
            try {
              found = true;
              count++;
              https.get(results[i].url, { rejectUnauthorized: false }, (r) => {
                r.pipe(file);
                file.on("finish", () => {
                  fs.stat(name, (err, stats) => {
                    if (err) {
                      console.error(err);
                      return;
                    }
                    if (stats.size > MAX_FILE_SIZE) {
                      api.sendMessage({
                        body: `File is too big to be sent through Facebook Messenger. Here is the URL: ${results[i].url}`
                      }, event.threadID, event.messageID);
                      if (fs.existsSync(name)) {
                        fs.unlink(name, console.error);
                      }
                    } else {
                      if (count === 1) {
                        api.sendMessage(`Your ${fileType} file has been found!`, event.threadID, event.messageID);
                      }
                      setTimeout(() => {
                        api.sendMessage({
                          body: `Here's your ${fileType} file\n\nTitle: ${results[i].title}\nSauce: ${results[i].url}`,
                          attachment: fs.createReadStream(name).on("end", () => {
                            if (fs.existsSync(name)) {
                              fs.unlink(name, (err) => {
                                if (err) return console.error(`Error [${fileType}]: ` + err);
                                if (count === results.length) {
                                  api.setMessageReaction("✅", event.messageID, (err) => { }, true);
                                }
                              });
                            }
                          }),
                        },
                          event.threadID,
                          event.messageID
                        );
                      }, FILE_SEND_DELAY * i);
                    }
                  });
                });
              });
            } catch (e) {
              if (fs.existsSync(name)) {
                fs.unlink(name, (err) => {
                  if (err) return console.error(`Error [${fileType}]: ` + err);
                });
              }
              found = false;
            }
          }
        }
        if (found) {
          api.sendMessage(`Search finished! ${count} ${fileType} files were found.`, event.threadID, event.messageID);
        } else {
          api.sendMessage(`I can't find a ${fileType} file on my query.`, event.threadID, event.messageID);
        }
      } else {
        api.sendMessage("Sorry, there was an error processing your request. Please try again later.", event.threadID, event.messageID);
      }
    })();
  }
}

module.exports = getFile;
