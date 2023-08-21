const fs = require('fs');
const path = require('path');

async function sysCommand(event, api) {
  const filePath = path.join(__dirname, '..', 'json', 'userpanel.json');
  const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const vips = items.userpanel.VIPS;
  const senderID = event.senderID;

  if (!vips.includes(senderID)) {
    api.sendMessage("🚫 Access Denied. You lack the necessary permissions to utilize this command.", event.threadID);
    return;
  }

  const input = event.body.toLowerCase().split(' ');
  const action = input[1];

  if (!action || action === '-help') {
    api.sendMessage('Command Usage:\n\n✅ joinleftnotif -on: Activates the system.\n✅ joinleftnotif -off: Deactivates the system.\n\n⚠️ Warning: Only VIP users are authorized to use this command.', event.threadID);
    return;
  }

  const settingsFilePath = path.join(__dirname, '..', 'json', 'settings.json');
  const settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf8'));

  if (action === '-on') {
    settings[1].joinleftnotif = true;
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings), 'utf8');
    api.sendMessage('✅ System Status Update: \n\nThe joinleft notification has been successfully activated.', event.threadID);
  } else if (action === '-off') {
    settings[1].joinleftnotif = false;
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings), 'utf8');
    api.sendMessage('⛔ System Status Update: \n\nThe joinleft notification has been successfully deactivated.', event.threadID);
  } else {
    api.sendMessage('❌ Error: Invalid action. Please use ", joinleftnotif -help" for a list of valid commands.', event.threadID);
  }
}

module.exports = sysCommand;
