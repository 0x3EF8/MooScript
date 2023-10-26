const fs = require('fs');
const path = require('path');

async function clearCache(event, api) {
  const input = event.body.toLowerCase().trim();

  if (input.includes("-help")) {
    const usage = "Usage: clearcache\n\n" +
      "Description: Clears the cache by deleting all attachments stored in the cache folder.\n";
    api.sendMessage(usage, event.threadID);
    return;
  }

  const folderPath = path.join(__dirname, '../temp/');

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(err);
      api.sendMessage("❌ Failed to delete attachments", event.threadID);
      return;
    }

    const count = files.length;
    files.forEach(file => {
      fs.unlinkSync(path.join(folderPath, file));
    });

    api.sendMessage(`✅ Deleted ${count} attachment(s)`, event.threadID);
  });
}

module.exports = clearCache;
