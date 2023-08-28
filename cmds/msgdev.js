const moment = require('moment-timezone');

async function msgdev(event, api) {
  const input = event.body.toLowerCase().split(' ');

  if (input.includes('-help')) {
    const usage = "Usage: msgdevs [message]\n\n" +
      "Description: Sends a message to the Hexclan developers.\n\n" +
      "Example: msgdevs Can you help me with an issue?\n\n" +
      "Note: The command expects a message input.";
    api.sendMessage(usage, event.threadID);
    return;
  }

  const message = input.slice(1).join(' ').trim();
  if (message.length === 0) {
    return api.sendMessage('Please input a message.', event.threadID);
  }

  const senderID = event.senderID.split(':')[0];
  const userInfo = await api.getUserInfo(senderID);
  const senderName = userInfo && userInfo[senderID] ? userInfo[senderID].name : `@${senderID}`;

  const timezone = 'Asia/Manila';
  const date = moment().tz(timezone).format('MM/DD/YY');
  const time = moment().tz(timezone).format('h:mm:ss A');

  const developerMessage = `You have a new message, sensei\nFrom @${senderName}\n\n${message}\n\nTime: ${time} (${timezone})\nDate: ${date}`;
  const developerThreadID = '24104736202459260';

  try {
    await api.sendMessage({
      body: developerMessage,
      mentions: [{
        tag: `@${senderName}`,
        id: senderID,
      }],
    }, developerThreadID);

    await api.sendMessage('Your message has been sent to the developer. Thank you!', event.threadID);
  } catch (error) {
    console.error('Error sending message to developer:', error);
    return api.sendMessage('An error occurred. Please try again later.', event.threadID);
  }
}

module.exports = msgdev;
