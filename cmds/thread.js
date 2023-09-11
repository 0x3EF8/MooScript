async function thread(event, api) {
  const input = event.body.toLowerCase().trim();
  const threadID = event.threadID;
  
  if (input === 'thread') {
    api.getThreadInfo(threadID, (err, info) => {
      if (err) return console.error(err);
      
      const message = {
        body: `Thread ID: ${info.threadID}\nName: ${info.threadName}`,
      };
      api.sendMessage(message, threadID);
    });
  } else if (input === 'thread -list') {
    api.getThreadList(500, null, ["INBOX"], (err, list) => {
      if (err) return console.error(err);
      
      list = list.filter(thread => thread.isGroup); 
      list.sort((a, b) => {
        if (a.name && b.name) {
          return a.name.localeCompare(b.name); 
        } else {
          return 0;
        }
      });
  
      let threads = "All Nexus Groups\n\n";
      for (let i = 0; i < list.length; i++) {
        threads += `Group ${i + 1}: ${list[i].name}\nGroupID: ${list[i].threadID}\n\n`;
      }
      
      api.sendMessage(threads, threadID);
    });
  } else if (input === 'thread -help') {
    const message = {
      body: `Usage: thread\nExample: thread\nDescription: Show the current thread.\n\n` +
        `Usage: thread -list\nExample: thread -list\nDescription: Show all Nexus groups.\n\n` +
        `Usage: thread -help\nExample: thread -help\nDescription: Show usage and examples for the thread command.`
    };
    api.sendMessage(message, threadID);
  }
}

module.exports = thread;
