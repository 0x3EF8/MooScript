const fs = require('fs');
const path = require('path');

function handleVIPCommand(event, api) {
  if (event.body.includes('-help')) {
    const usage = "Usage: vip [-add/-rem] [reply to user]\n\n" +
      "Description:\n" +
      "  - vip -add: Adds the replied user to the VIP Users List.\n" +
      "  - vip -rem: Removes the replied user from the VIP Users List.\n\n" +
      "Note: Only the developer can use this command by replying to a user's message.";
    api.sendMessage(usage, event.threadID);
    return Promise.resolve();
  }

  const command = event.body.split(' ')[1];

  if (command === '-add') {
    return addVIP(event, api);
  } else if (command === '-rem') {
    return remVIP(event, api);
  } else {
    api.sendMessage("Invalid command. Use 'vip -help' to see the available options.", event.threadID);
    return Promise.resolve();
  }
}

function addVIP(event, api) {
  return new Promise((resolve, reject) => {
    if (!event.senderID.includes("100092581786728")) return resolve();

    const { threadID, messageReply } = event;
    if (!messageReply) return resolve();

    const filePath = path.join(__dirname, '..', 'json', 'userpanel.json');
    const items = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const vips = items.userpanel.VIPS;

    const userId = messageReply.senderID;

    api.getUserInfo(parseInt(userId), (error, data) => {
      if (error) {
        console.error(error);
        return reject(error);
      }
      const name = data[userId].name;
      if (vips.includes(userId)) {
        api.sendMessage(`${name} is already on the VIP Users List`, threadID);
        resolve();
      } else {
        vips.push(userId);
        fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf8");
        api.sendMessage(`${name} has been successfully added to the VIP Users List`, threadID);
        resolve();
      }
    });
  });
}

function remVIP(event, api) {
  return new Promise((resolve, reject) => {
    if (!event.senderID.includes("100092581786728")) return resolve();

    const { threadID, messageReply } = event;
    if (!messageReply) return resolve();

    const filePath = path.join(__dirname, '..', 'json', 'userpanel.json');
    const items = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const vips = items.userpanel.VIPS;

    const userId = messageReply.senderID;

    api.getUserInfo(parseInt(userId), (error, data) => {
      if (error) {
        console.error(error);
        return reject(error);
      }

      const name = data[userId].name;

      if (vips.includes(userId)) {
        const removeIndex = vips.indexOf(userId);
        vips.splice(removeIndex, 1);
        fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf8");
        api.sendMessage(`VIP privilege for ${name} has been successfully revoked`, threadID);
        resolve();
      } else {
        api.sendMessage(`${name} is not found on the VIP Users List`, threadID);
        resolve();
      }
    });
  });
}

module.exports = handleVIPCommand;
