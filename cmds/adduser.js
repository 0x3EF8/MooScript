const path = require('path');
const fs = require('fs');

function addCollectedUidsToGroup(event, api) {
  const threadID = event.threadID;
  const senderID = event.senderID;

  const filePath = path.join(__dirname, '..', 'json', 'userpanel.json');
  const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const vips = items.userpanel.VIPS;

  if (!vips.includes(senderID)) {
    api.sendMessage('🚫 Access Denied. You lack the necessary permissions to utilize this command.', threadID)
      .catch((err) => {
        console.error('Error sending access denied message:', err);
      });
    return;
  }

  const uidsFilePath = path.join(__dirname, '..', 'json', 'uids.json');
  let uids = JSON.parse(fs.readFileSync(uidsFilePath, 'utf8'));

  let successCount = 0;
  let failCount = 0;

  function addUser(uid) {
    if (uids.length === 0) {
      const totalCount = successCount + failCount;
      const message = `✅ Users added: ${successCount}\n❌ Failed to add: ${failCount}\nTotal: ${totalCount}`;
      api.sendMessage(message, threadID)
        .then(() => {
          
          fs.writeFileSync(uidsFilePath, JSON.stringify(uids), 'utf8');
        })
        .catch((err) => {
          console.error('Error sending completion message:', err);
        });
      return;
    }

    api.addUserToGroup(uid, threadID)
      .then(() => {
        successCount++;

        const index = uids.indexOf(uid);
        if (index !== -1) {
          uids.splice(index, 1);
        }

        addUser(uids[0]);
      })
      .catch((err) => {
        console.error('Error adding user to the group:', err);
        failCount++;


        addUser(uids[0]);
      });
  }

  addUser(uids[0]);
}

module.exports = addCollectedUidsToGroup;
