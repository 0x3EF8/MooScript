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

function isadmins(userId) {
  const config = readConfig();
  if (config !== null && config.hasOwnProperty('admins')) {
    const adminsList = config.admins || [];
    return adminsList.includes(userId);
  }
  return false;
}

function muteCommand(event, api) {
  if (event.body.includes('-help')) {
    const usage = "Usage: mute [-add/-rem] [user ID]\n\n" +
      "Description:\n" +
      "  - mute -add: Adds the specified user to the mute list.\n" +
      "  - mute -rem: Removes the specified user from the mute list.\n\n" +
      "Note: Only admins can use this command.";
    api.sendMessage(usage, event.threadID);
    return Promise.resolve();
  }

  const command = event.body.split(' ')[1];

  if (command === '-add' || command === '-rem') {
    if (!isadmins(event.senderID)) {
      api.sendMessage("Only admins can use this command.", event.threadID);
      return Promise.resolve();
    }

    if (command === '-add') {
      return addMutedUser(event, api);
    } else if (command === '-rem') {
      return removeMutedUser(event, api);
    }
  } else {
    // Show the list of muted users
    const exceptionList = readExceptionList();
    if (exceptionList !== null && exceptionList.hasOwnProperty('users')) {
      const usersList = exceptionList.users.map(userId => `├─⦿ ${userId}`).join('\n');
      const totalUsers = exceptionList.users.length;
      const message = `
┌────[ Muted Users ]────⦿
│
${usersList}
│
└────[ Total Muted Users: ${totalUsers} ]────⦿
`;
      api.sendMessage(message, event.threadID);
    } else {
      api.sendMessage("An error occurred while reading the muted users list.", event.threadID);
    }
    return Promise.resolve();
  }
}

function addMutedUser(event, api) {
  return new Promise((resolve, reject) => {
    const { threadID, messageReply } = event;
    if (!messageReply) return resolve();

    const exceptionListPath = path.join(__dirname, '..', 'json', 'exceptionList.json');
    const exceptionList = readExceptionList();
    const usersList = exceptionList.users || [];

    const userId = messageReply.senderID;

    api.getUserInfo(parseInt(userId), (error, data) => {
      if (error) {
        console.error(error);
        return reject(error);
      }
      const name = data[userId].name;
      if (usersList.includes(userId)) {
        api.sendMessage(`${name} is already muted.`, threadID);
        resolve();
      } else {
        usersList.push(userId);
        exceptionList.users = usersList;
        fs.writeFileSync(exceptionListPath, JSON.stringify(exceptionList, null, 2), "utf8");
        api.sendMessage(`${name} has been successfully muted.`, threadID);
        resolve();
      }
    });
  });
}

function removeMutedUser(event, api) {
  return new Promise((resolve, reject) => {
    const { threadID, messageReply } = event;
    if (!messageReply) return resolve();

    const exceptionListPath = path.join(__dirname, '..', 'json', 'exceptionList.json');
    const exceptionList = readExceptionList();
    const usersList = exceptionList.users || [];

    const userId = messageReply.senderID;

    api.getUserInfo(parseInt(userId), (error, data) => {
      if (error) {
        console.error(error);
        return reject(error);
      }

      const name = data[userId].name;

      if (usersList.includes(userId)) {
        const removeIndex = usersList.indexOf(userId);
        usersList.splice(removeIndex, 1);
        exceptionList.users = usersList;
        fs.writeFileSync(exceptionListPath, JSON.stringify(exceptionList, null, 2), "utf8");
        api.sendMessage(`${name} is no longer muted.`, threadID);
        resolve();
      } else {
        api.sendMessage(`${name} is not found in the muted users list.`, threadID);
        resolve();
      }
    });
  });
}

function readExceptionList() {
  const exceptionListPath = path.join(__dirname, '..', 'json', 'exceptionList.json');
  try {
    return JSON.parse(fs.readFileSync(exceptionListPath));
  } catch (error) {
    console.error('Error reading exception list:', error);
    return null;
  }
}

module.exports = muteCommand;
