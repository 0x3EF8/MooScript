const path = require('path');
const fs = require('fs');

function readSettings() {
  const settingsPath = path.join(__dirname, '..', 'json', 'settings.json');
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath));

    const formattedSettings = settings.map((item) => {
      const sysStatus = item.system ? '✅ True' : '❌ False';
      const autoReactStatus = item.autoreact ? '✅ True' : '❌ False';
      const antiLeaveStatus = item.antileave ? '✅ True' : '❌ False';
      const antiUnsendStatus = item.antiunsend ? '✅ True' : '❌ False';
      const listenEventsStatus = item.listenEvents ? '✅ True' : '❌ False';
      const selfListenStatus = item.selfListen ? '✅ True' : '❌ False';
      const autoMarkReadStatus = item.autoMarkRead ? '✅ True' : '❌ False';
      const autoMarkDeliveryStatus = item.autoMarkDelivery ? '✅ True' : '❌ False';
      const forceLoginStatus = item.forceLogin ? '✅ True' : '❌ False';

      return `├─⦿ System: ${sysStatus}
├─⦿ AntiLeave: ${antiLeaveStatus}
├─⦿ AutoReact: ${autoReactStatus}
├─⦿ AntiUnsend: ${antiUnsendStatus}
├─⦿ ListenEvents: ${listenEventsStatus}
├─⦿ SelfListen: ${selfListenStatus}
├─⦿ AutoMarkRead: ${autoMarkReadStatus}
├─⦿ AutoMarkDelivery: ${autoMarkDeliveryStatus}
├─⦿ ForceLogin: ${forceLoginStatus}`; 
    });

    return formattedSettings.join('\n');
  } catch (error) {
    console.error('Error reading settings:', error);
    return '❌ An error occurred while reading the settings.';
  }
}

function updateSettings(settingName, value, senderID) {
  const configPath = path.join(__dirname, '..', 'json', 'config.json');
  try {
    const config = JSON.parse(fs.readFileSync(configPath));
    const adminsList = config.admins || [];
    
    if (!adminsList.includes(senderID)) {
      return '🚫 Access Denied. You lack the necessary permissions to utilize this command.';
    }

    const filePath = path.join(__dirname, '..', 'json', 'settings.json');
    const settings = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let updated = false;

    const updatedSettings = settings.map((item) => {
      for (const key in item) {
        if (key.toLowerCase() === settingName.toLowerCase()) {
          const newValue = value === 'true';
          if (item[key] !== newValue) {
            item[key] = newValue;
            updated = true;
          } else {
            updated = 'nochange';
          }
        }
      }
      return item;
    });

    if (updated === 'nochange') {
      return `⚠️ Setting ${settingName} is already set to ${value}. No change made.`;
    }

    fs.writeFileSync(filePath, JSON.stringify(updatedSettings, null, 2));
    return updated
      ? `✅ Setting ${settingName} updated to ${value} successfully.`
      : '❌ No matching setting found.';
  } catch (error) {
    console.error('Error updating settings:', error);
    return '❌ An error occurred while updating the settings.';
  }
}

function settingsCommand(event, api) {
  const input = event.body.toLowerCase().split(' ');

  if (input.includes('-help')) {
    const usage = '💡 Usage:\n\n' +
      'To view settings:\nsettings\n\n' +
      'To update settings:\nsettings -set [settingName] [value]\n\n' +
      'Example:\nsettings -set system true\n\n' +
      'Note: Value must be "true" or "false".';
    api.sendMessage(usage, event.threadID);
    return;
  }

  if (input.includes('-set')) {
    const settingName = input[input.indexOf('-set') + 1];
    const value = input[input.indexOf('-set') + 2];
    const senderID = event.senderID;

    if (settingName && (value === 'true' || value === 'false')) {
      const result = updateSettings(settingName, value, senderID);
      api.sendMessage(result, event.threadID, event.messageID);
    } else {
      api.sendMessage('❌ Invalid usage. Type "settings -help" for usage instructions.', event.threadID, event.messageID);
    }
  } else {
    const settings = readSettings();
    const message = `
┌───[ Hexabot Settings ]───⦿
│
${settings}
│
└────────⦿
    `;
    api.sendMessage(message, event.threadID, event.messageID);
  }
}

module.exports = settingsCommand;
