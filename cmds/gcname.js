async function setGroupTitle(event, api) {
  const input = event.body.split(' ');

  if (input.length > 1 && input[1] === '-help') {
    const usage = 'Usage: groupname [newTitle]\n\n' +
      'Description: Sets the title of the current group chat to the new title.\n\n' +
      'Example: groupname "New Group Title"\n\n' +
      'Note: The new title must be enclosed in double quotation marks.';
    api.sendMessage(usage, event.threadID);
    return;
  }

  const newTitle = input.slice(1).join(' ');

  if (!newTitle) {
    api.sendMessage('Invalid command format. Usage: groupname [newTitle] \n\nType groupname -help for more info', event.threadID);
    return;
  }

  api.setTitle(newTitle, event.threadID, (err, obj) => {
    if (err) {
      console.error('Error setting group title:', err);
      api.sendMessage('Failed to set the group title. Please try again later.', event.threadID);
      return;
    }

    api.sendMessage(`The group title has been set to "${newTitle}" successfully.`, event.threadID);
  });
}

module.exports = setGroupTitle;
