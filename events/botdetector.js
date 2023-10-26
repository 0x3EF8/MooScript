const fs = require("fs");
const path = require('path');

const exceptionListPath = path.join(__dirname, '..', 'json', 'exceptionList.json');
const configPath = path.join(__dirname, '..', 'json', 'config.json');

async function isBot(api, event) {
  if (typeof event.body === 'string') {
    const userMessage = event.body.toLowerCase();

    const botMessageFragments = [
      "your keyboard level",
      "active antiout mode",
      "auto greet",
      "message from admin",
      "ulul bitch dika makakaalis tanginamo",
      "iyong ka pogian nasa level na",
      "good evening everyone 😏",
      "[admin] admin list",
      "admin and bot information",
      "an error has occurred",
      "commands list",
      "unsent this message",
      "removed a message",
      "that's my prefix",
      "page cmds",
      "have a nice day ❤️",
      "your keyboard hero level",
      "reply to messages by number to view",
      "my prefix is",
      "box chat",
      "member of this group, please enjoy",
      "notification from the admin",
      "you are unable to use bot",
      "how can i help you ?",
      "how can I assist you today?",
      "thread update",
      "reply to this message with the index",
      "is there something you would like to ask or discuss?",
      "how may I help you?",
      "as a language model",
      "as an ai",
      "something went wrong",
      "notification from admin",
      "here's my prefix:",
      "left the group",
      "unsend the message",
      "the command you used doesn't exist",
      "facebook user",
      "automated greeting",
      "has left by itself from the group",
      "as an ai language",
      "approval required",
      "𝗉𝗅𝖺𝗒𝗌𝖻𝗈𝗍",
      "you are requesting to ban user"
    ];

    if (!isAdminOrVIP(event.senderID) && botMessageFragments.some(fragment => userMessage.includes(fragment.toLowerCase()))) {
      try {
        const exceptionListData = fs.readFileSync(exceptionListPath, 'utf-8');
        const exceptionList = JSON.parse(exceptionListData);

        if (!exceptionList.bots.includes(event.senderID)) {
          exceptionList.bots.push(event.senderID);
          fs.writeFileSync(exceptionListPath, JSON.stringify(exceptionList, null, 2));

          const userInfo = await api.getUserInfo(event.senderID);
          const confirmationMessage = `**Automated Security Alert**

User Detected as a Potential Bot:

User ID: ${event.senderID}
User Name: ${userInfo[event.senderID].name}

This user has been added to the exception list to prevent spam and maintain a secure environment.`;

          api.sendMessage(confirmationMessage, event.threadID);
        }
      } catch (err) {
        console.error("Error while processing isBot event:", err);
      }
    }
  }
}

function isAdminOrVIP(userID) {
  const configData = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(configData);

  return config.admins.includes(userID) || config.vips.includes(userID);
}

module.exports = isBot;
