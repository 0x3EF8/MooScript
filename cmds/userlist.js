const fs = require('fs');
const path = require('path');

async function countBotUsers(event, api) {
  const input = event.body.toLowerCase().split(' ');

  if (input.length > 1 && input[1] === '-help') {
    const usage = 'Usage: countBotUsers\n\n' +
      'Description: Counts the number of bot users based on the stored appstate files.\n\n' +
      'Example: countBotUsers\n\n' +
      'Note: This command reads the appstate files stored in a specific folder and counts the number of bot users.';
    api.sendMessage(usage, event.threadID);
    return;
  }

  const appstateFolderPath = path.join(__dirname, '..', '0x3', 'credentials', 'cookies');

  fs.readdir(appstateFolderPath, async (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    const appStates = files.filter(file => path.extname(file).toLowerCase() === '.json');

    const botUsers = [];

    for (const appState of appStates) {
      const appStateData = JSON.parse(fs.readFileSync(path.join(appstateFolderPath, appState), 'utf8'));

      try {
        const c_userCookie = appStateData.find(cookie => cookie.key === 'c_user');

        if (c_userCookie) {
          const uid = c_userCookie.value;
          const userInfo = await api.getUserInfo(uid);

          if (userInfo && userInfo[uid]) {
            const name = userInfo[uid].name;
            botUsers.push({ name, uid });
          } 
        }
      } catch (error) {
        console.error('Error retrieving user info:', error);
      }
    }

    const totalBotUsers = botUsers.length;
    let message = 'BotGenius (BETA) Users\n\n';
    for (const user of botUsers) {
      message += `Name: ${user.name}\nUID: ${user.uid}\n\n`;
    }
    message += `Total Bot Users: ${totalBotUsers}`;

    await api.sendMessage(message, event.threadID);
  });
}

module.exports = countBotUsers;
