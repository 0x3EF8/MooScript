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

function updateConfig(settingName, value) {
  const configPath = path.join(__dirname, '..', 'json', 'config.json');
  try {
    const config = readConfig();

    if (config !== null && config.hasOwnProperty(settingName)) {
      
      if (value === 'true' || value === 'false') {
        config[settingName] = value === 'true';
      } else {
        config[settingName] = value;
      }

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      return `✅ Config ${settingName.charAt(0).toUpperCase() + settingName.slice(1)} updated to ${value} successfully.`;
    } else {
      return '❌ Setting not found in the configuration.';
    }
  } catch (error) {
    console.error('Error updating config:', error);
    return '❌ An error occurred while updating the configuration.';
  }
}

function configCommand(event, api) {
  const input = event.body.toLowerCase().split(' ');

  if (input.includes('-help')) {
    const usage = '💡 Usage:\n\n' +
      'To view configuration:\nconfig\n\n' +
      'To update configuration (adminss only):\nconfig -set [settingName] [value]\n\n' +
      'Example:\nconfig -set prefix $\n\n' +
      'Note: Value can be any valid JSON value, such as true, false, or a string.';
    api.sendMessage(usage, event.threadID);
    return;
  }

  if (input.includes('-set')) {
    if (!isadmins(event.senderID)) {
      api.sendMessage("Only adminss can use the -set command.", event.threadID);
      return;
    }

    const settingName = input[input.indexOf('-set') + 1];
    const value = input.slice(input.indexOf('-set') + 2).join(' ');

    if (settingName) {
      const result = updateConfig(settingName, value);
      api.sendMessage(result, event.threadID, event.messageID);
    } else {
      api.sendMessage('❌ Invalid usage. Type "config -help" for usage instructions.', event.threadID, event.messageID);
    }
  } else {
    const config = readConfig();
    if (config !== null) {
      let formattedConfig = [];
      for (const [key, val] of Object.entries(config)) {
        if (key === 'admins') {
          const adminsCount = val.length;
          formattedConfig.push(`├─⦿ ${key.charAt(0).toUpperCase() + key.slice(1)}: ${val[0]} +${adminsCount - 1}`);
        } else if (key === 'vips' && val.length > 0) {
          formattedConfig.push(`├─⦿ ${key.charAt(0).toUpperCase() + key.slice(1)}: ${val[0]} +${val.length - 1}`);
        } else {
          formattedConfig.push(`├─⦿ ${key.charAt(0).toUpperCase() + key.slice(1)}: ${val}`);
        }
      }

      const message = `
┌────[ Configuration ]────⦿
│
${formattedConfig.join('\n')}
│
└────────⦿
      `;
      api.sendMessage(message, event.threadID, event.messageID);
    } else {
      api.sendMessage('❌ An error occurred while reading the configuration.', event.threadID, event.messageID);
    }
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

module.exports = configCommand;
