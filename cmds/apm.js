async function acceptAllMessageRequests(event, api) {
  const input = event.body.toLowerCase().split(' ');

  if (input.includes('-help')) {
    const usage = 'Usage: apm\n\n' +
      'Description: Accepts all pending message requests in the inbox.\n\n' +
      'Example: apm\n\n' +
      'Note: This command will accept all pending message requests in the inbox.';
    api.sendMessage(usage, event.threadID);
    return;
  }

  api.getThreadList(20, null, ['PENDING'], (err, threads) => {
    if (err) {
      console.error('Error getting thread list:', err);
      return;
    }

    const threadIDs = threads.map(thread => thread.threadID);

    api.handleMessageRequest(threadIDs, true, (err) => {
      if (err) {
        console.error('Error accepting message requests:', err);
        return;
      }

      api.sendMessage('All pending message requests have been accepted.', event.threadID);
    });
  });
}

module.exports = acceptAllMessageRequests;
