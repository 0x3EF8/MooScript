const fs = require('fs');
const path = require('path');

function readUserPanel() {
  const userPanelPath = path.join(__dirname, '..', 'json', 'userpanel.json');
  try {
    return JSON.parse(fs.readFileSync(userPanelPath));
  } catch (error) {
    console.error('Error reading userpanel:', error);
    return null;
  }
}

function isAdmin(userId) {
  const configPath = path.join(__dirname, '..', 'json', 'config.json');
  try {
    const config = JSON.parse(fs.readFileSync(configPath));
    const adminList = config.admin || [];
    return adminList.includes(userId);
  } catch (error) {
    console.error('Error reading config:', error);
    return false;
  }
}

function VIPCommand(event, api) {
  if (event.body.includes('-help')) {
    const usage = "Usage: vip [-add/-rem] [reply to user]\n\n" +
      "Description:\n" +
      "  - vip -add: Adds the replied user to the VIP Users List.\n" +
      "  - vip -rem: Removes the replied user from the VIP Users List.\n\n" +
      "Note: Only admins can use this command by replying to a user's message.";
    api.sendMessage(usage, event.threadID);
    return Promise.resolve();
  }

  const command = event.body.split(' ')[1];

  if (command === '-add' || command === '-rem') {
    if (!isAdmin(event.senderID)) {
      api.sendMessage("Only admins can use this command.", event.threadID);
      return Promise.resolve();
    }

    if (command === '-add') {
      return addVIP(event, api);
    } else if (command === '-rem') {
      return remVIP(event, api);
    }
  } else {
    const userPanel = readUserPanel();
    if (userPanel !== null && userPanel.userpanel.hasOwnProperty('VIPS')) {
      const vipList = userPanel.userpanel.VIPS.map(userId => `├─⦿ ${userId}`).join('\n');
      const totalVIPs = userPanel.userpanel.VIPS.length;
      const message = `
┌────[ Hexabot VIP Users ]────⦿
│
${vipList}
│
└────[ Total VIP users: ${totalVIPs} ]────⦿
`;
      api.sendMessage(message, event.threadID);
    } else {
      api.sendMessage("An error occurred while reading the VIP user list.", event.threadID);
    }
    return Promise.resolve();
  }
}

function addVIP(event, api) {
  return new Promise((resolve, reject) => {
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

module.exports = VIPCommand;
