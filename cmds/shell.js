const path = require('path');
const fs = require('fs');

function isadmins(userId) {
  const configPath = path.join(__dirname, '..', 'json', 'config.json');
  try {
    const config = JSON.parse(fs.readFileSync(configPath));
    const adminsList = config.admins || [];
    return adminsList.includes(userId);
  } catch (error) {
    console.error('Error reading config:', error);
    return false;
  }
}

function shell(event, api) {
  try {
    if (!isadmins(event.senderID)) {
      api.sendMessage('🚫 Access Denied. You lack the necessary permissions to utilize this command.', event.threadID);
      return;
    }

    if (!!event.body.split(" ")[1] && event.body.split(" ")[1].includes("-help")) {
      const usage =
        "Name: Shell\n\n" +
        "Usage: Shell [cmd]\n\n" +
        "Description: A shell command.";
      return api.sendMessage(usage, event.threadID, event.messageID);
    }

    let data = event.body.split(" ");
    const { exec } = require("child_process");

    if (data.length < 2) {
      api.sendMessage("Enter command.", event.threadID, event.messageID);
    } else {
      data.shift();
      let cmd = data.join(" ");
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          api.sendMessage(`${error.message}`, event.threadID, event.messageID);
          return;
        }
        if (stderr) {
          api.sendMessage(`StdErr:\n ${stderr}\n${stdout}`, event.threadID, event.messageID);
          return;
        }
        api.sendMessage(`${stdout}`, event.threadID, event.messageID);
      });
    }
  } catch (err) {
    api.sendMessage(`${err}`, event.threadID, event.messageID);
  }
}

module.exports = shell;
