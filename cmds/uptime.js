const moment = require('moment-timezone');

async function systemStatus(event, api) {
  const input = event.body.toLowerCase().trim();

  if (input.includes("-help")) {
    const usage = "Usage: systemstatus\n\n" +
      "Description: Retrieves the current system status.\n";
    api.sendMessage(usage, event.threadID);
    return;
  }

  const currentTime = moment().tz('Asia/Manila').format('YYYY-MM-DD hh:mm:ss A');

  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime - (hours * 3600)) / 60);
  const seconds = Math.floor(uptime % 60);
  const uptimeStr = `System is up for ${hours} hours, ${minutes} minutes, and ${seconds} seconds`;

  const threads = await api.getThreadList(99999, null, ['INBOX']);

  let userCount = 0;
  let groupCount = 0;

  threads.forEach(thread => {
    if (thread.isGroup) {
      groupCount++;
    } else {
      userCount++;
    }
  });

  const output = `🤖 System Status\n\n` +
    `As of ${currentTime},\n` +
    `Total Users: ${userCount}\n` +
    `Total Threads: ${groupCount}\n\n` +
    `${uptimeStr}`;

  api.sendMessage(output, event.threadID);
}

module.exports = systemStatus;
