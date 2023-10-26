const path = require('path');
const fs = require('fs');

const configFilePath = path.join(__dirname, '..', 'json', 'config.json');

function loadConfig() {
  try {
    const data = fs.readFileSync(configFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { admins: [], vips: [] };
  }
}

async function restart(event, api) {
  const config = loadConfig();
  const admins = config.admins;
  const senderID = event.senderID;

  if (!admins.includes(senderID)) {
    api.sendMessage('⛔️ Access Denied. You lack the necessary permissions to utilize this command.', event.threadID);
    return;
  }

  api.sendMessage('⚙️ Restarting system...', event.threadID);
  setTimeout(() => {
    api.sendMessage('✅ System restart complete. The system is now back online.', event.threadID);
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }, 4000);
}

module.exports = restart;
