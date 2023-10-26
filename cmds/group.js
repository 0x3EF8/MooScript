async function changeAdminStatus(event, api) {
  const input = event.body.toLowerCase().split(' ');

  if (input.length > 1 && input[1] === '-help') {
    const usage = 'Usage: group -admin [user1] [user2] ...  -or-  group -remadmin [user1] [user2] ...\n\n' +
      'Description: Promotes or removes users as admin in the group chat.\n\n' +
      'Example (promote): group -admin @user1 @user2\n' +
      'Example (remove): group -remadmin @user1 @user2\n\n' +
      'Note: The users must be mentioned using "@mention".';
    api.sendMessage(usage, event.threadID);
    return;
  }

  const mentions = event.mentions;
  const mentionedUserIDs = Object.keys(mentions);
  const command = input[1];

  if (mentionedUserIDs.length === 0) {
    api.sendMessage('Invalid command format. At least one user must be mentioned.', event.threadID);
    return;
  }

  let adminStatus = true;
  if (command === '-remadmin') {
    adminStatus = false;
  } else if (command !== '-admin') {
    api.sendMessage('Invalid command. Use "group -admin [user1] [user2] ..." to promote users or "group -remadmin [user1] [user2] ..." to remove admin status.', event.threadID);
    return;
  }

  const userNames = [];
  for (const userID of mentionedUserIDs) {
    try {
      const userInfo = await api.getUserInfo(userID);
      userNames.push(userInfo[userID].name || 'Unknown User');
    } catch (err) {
      console.error('Error fetching user info:', err);
      userNames.push('Unknown User');
    }
  }

  api.changeAdminStatus(event.threadID, mentionedUserIDs, adminStatus, (err) => {
    if (err) {
      console.error('Error changing admin status:', err);
      api.sendMessage('Failed to update admin status. Please try again later.', event.threadID);
      return;
    }

    const action = adminStatus ? 'promoted to admin' : 'removed as admin';
    const userList = userNames.join(', ');

    api.sendMessage(`The following user(s) have been ${action}: ${userList}`, event.threadID);
  });
}

module.exports = changeAdminStatus;
