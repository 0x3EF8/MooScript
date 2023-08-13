
async function createNewGroup(event, api) {
  const input = event.body.toLowerCase().split(' ');

  if (input.includes('-help')) {
    const usage = 'Usage: createGroup [participant1] [participant2] ... -[groupTitle]\n\n' +
      'Description: Creates a new group chat with the specified participants and optional group title.\n\n' +
      'Example: createGroup @user1 @user2 @user3 -this is a test\n\n' +
      'Note: The participants must be mentioned using "@mention". The group title must start with a hyphen "-" followed by the title.';
    api.sendMessage(usage, event.threadID);
    return;
  }

  const mentions = event.mentions;
  const participantIDs = Object.keys(mentions);
  let groupTitle = '';

  const titleIndex = input.findIndex(word => word.startsWith('-'));
  if (titleIndex !== -1 && titleIndex < input.length) {
    groupTitle = input.slice(titleIndex).join(' ').substring(1);
  }

  if (participantIDs.length < 2) {
    api.sendMessage('Invalid command format. At least two participants must be mentioned.', event.threadID);
    return;
  }

  const creatorID = event.senderID;
  participantIDs.push(creatorID);

  api.createNewGroup(participantIDs, groupTitle, async (err, threadID) => {
    if (err) {
      console.error('Error creating group chat:', err);
      api.sendMessage('Failed to create the new group chat. Please try again later.', event.threadID);
      return;
    }

    try {
      const changeAdminStatusAsync = (threadID, participantIDs) => {
        return new Promise((resolve, reject) => {
          api.changeAdminStatus(threadID, participantIDs, true, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      };

      await changeAdminStatusAsync(threadID, participantIDs);
      
      api.getThreadInfo(threadID, (err, groupInfo) => {
        if (err) {
          console.error('Error getting group info:', err);
          api.sendMessage('The new group chat has been created successfully. Group ID: ' + threadID, event.threadID);
          return;
        }

        const groupName = groupTitle || groupInfo.name || 'Unnamed Group';
        api.sendMessage('The new group chat has been created successfully. Group Name: ' + groupName + ', Group ID: ' + threadID, event.threadID);
      });
    } catch (error) {
      console.error('Error setting group admin:', error);
      api.sendMessage('The new group chat has been created successfully, but an error occurred while setting you as the group admin. Please contact the group creator to make you an admin manually.', event.threadID);
    }
  });
}

module.exports = createNewGroup;

