const fs = require('fs');
const path = require('path');

function readConfig() {
  const configPath = path.join(__dirname, '..', 'json', 'config.json');
  try {
    return JSON.parse(fs.readFileSync(configPath));
  } catch (error) {
    console.error('Error reading config:', error);
    return null;
  }
}

function isadmins(userId, config) {
  const adminsList = config.admins || [];
  return adminsList.includes(userId);
}

function VIPCommand(event, api) {
  const config = readConfig();

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
    if (!isadmins(event.senderID, config)) {
      api.sendMessage("Only admins can use this command.", event.threadID);
      return Promise.resolve();
    }

    if (command === '-add') {
      return addVIP(event, api, config);
    } else if (command === '-rem') {
      return remVIP(event, api, config);
    }
  } else {
    const vipList = config.vips || [];
    const totalVIPs = vipList.length;
    const message = `
┌────[ Hexabot VIP Users ]────⦿
│
${vipList.map(userId => `├─⦿ ${userId}`).join('\n')}
│
└────[Total VIP users: ${totalVIPs}]────⦿
`;
    api.sendMessage(message, event.threadID);
    return Promise.resolve();
  }
}

function addVIP(event, api, config) {
  return new Promise((resolve, reject) => {
    const { threadID, messageReply } = event;
    if (!messageReply) return resolve();

    const userId = messageReply.senderID;

    api.getUserInfo(parseInt(userId), (error, data) => {
      if (error) {
        console.error(error);
        return reject(error);
      }
      const name = data[userId].name;
      const vipList = config.vips || [];

      if (vipList.includes(userId)) {
        api.sendMessage(`${name} is already on the VIP Users List`, threadID);
        resolve();
      } else {
        vipList.push(userId);
        config.vips = vipList;
        updateConfig(config); 
        api.sendMessage(`${name} has been successfully added to the VIP Users List`, threadID);
        resolve();
      }
    });
  });
}

function remVIP(event, api, config) {
  return new Promise((resolve, reject) => {
    const { threadID, messageReply } = event;
    if (!messageReply) return resolve();

    const userId = messageReply.senderID;

    api.getUserInfo(parseInt(userId), (error, data) => {
      if (error) {
        console.error(error);
        return reject(error);
      }

      const name = data[userId].name;
      const vipList = config.vips || [];

      if (vipList.includes(userId)) {
        const removeIndex = vipList.indexOf(userId);
        vipList.splice(removeIndex, 1);
        config.vips = vipList; 
        updateConfig(config); 
        api.sendMessage(`VIP privilege for ${name} has been successfully revoked`, threadID);
        resolve();
      } else {
        api.sendMessage(`${name} is not found on the VIP Users List`, threadID);
        resolve();
      }
    });
  });
}

function updateConfig(config) {
  const configPath = path.join(__dirname, '..', 'json', 'config.json');
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error updating config:', error);
  }
}

module.exports = VIPCommand;
