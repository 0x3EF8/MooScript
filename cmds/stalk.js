const fs = require('fs');
const request = require('request');

async function stalkCommand(event, api) {
  try {
    var uid = Object.keys(event.mentions)[0];
    if (Object.keys(event.mentions) == 0) {
      api.sendMessage(`Error: Please tag someone to stalk.`, event.threadID, event.messageID);
      return;
    }

    let data = await api.getUserInfo(parseInt(uid));
    var picture = `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    var file = fs.createWriteStream(__dirname + "/../temp/stalk.png");
    var rqs = request(encodeURI(`${picture}`));
    rqs.pipe(file);

    file.on('finish', function () {
      var name = data[uid].name;
      var username = data[uid].vanity;
      var herGender = data[uid].gender;
      var type = data[uid].type;
      var url = data[uid].profileUrl;
      var firstName = data[uid].firstName;
      let gender = "";
      switch (herGender) {
        case 1:
          gender = "Female";
          break;
        case 2:
          gender = "Male";
          break;
        default:
          gender = "Custom";
      }

      api.sendMessage({
        body: `Information about ${firstName}\n\nName: ${name}\nUsername: ${username}\nGender: ${gender}\nType: ${type}\nProfile URL: ${url}\nUID: ${uid}`,
        attachment: fs.createReadStream(__dirname + '/../temp/stalk.png')
      }, event.threadID, event.messageID);
    });
  } catch (err) {
    console.error('Error:', err);
    api.sendMessage('An error occurred while stalking. Please try again later.', event.threadID, event.messageID);
  }
}

module.exports = stalkCommand;
