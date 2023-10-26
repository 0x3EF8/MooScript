const path = require('path');
const fs = require('fs');

let pendingThreads = [];

async function pendingCommand(event, api) {
  const { body, threadID } = event;
  const senderID = event.senderID;
  const command = body.split(' ')[1];

  if (command === '-help') {
    const usage = "Usage:\n" +
      "- To view the list of pending threads: `pending`\n" +
      "- To accept pending threads: `pending -accept [number(s)]`\n" +
      "- To cancel pending threads: `pending -cancel [number(s)]`";

    api.sendMessage(usage, threadID);
    return;
  }

  if (command === '-accept' || command === '-cancel') {
    const selectedThreads = body
      .split(/\s+/)
      .map(Number)
      .filter((num) => !isNaN(num) && num > 0 && num <= pendingThreads[senderID].length);

    if (selectedThreads.length === 0) {
      api.sendMessage('Invalid selection. Please enter valid numbers to accept or cancel pending threads.', threadID);
    } else {
      const acceptedThreads = [];
      const canceledThreads = [];

      for (const selectedThread of selectedThreads) {
        const index = selectedThread - 1;
        const threadInfo = pendingThreads[senderID][index];
        if (threadInfo) {
          if (threadInfo.action === 'accept') {
            acceptedThreads.push(threadInfo.threadID);
          } else if (threadInfo.action === 'cancel') {
            canceledThreads.push(threadInfo.threadID);
          }
        }
      }

      if (acceptedThreads.length > 0) {
        api.sendMessage(`Accepted ${acceptedThreads.length} pending threads.`, threadID);
        acceptedThreads.forEach((threadID) => {
          api.sendMessage('Your request has been accepted.', threadID);
        });
      }

      if (canceledThreads.length > 0) {
        api.sendMessage(`Canceled ${canceledThreads.length} pending threads.`, threadID);
        canceledThreads.forEach((threadID) => {
          api.removeUserFromGroup(senderID, threadID);
        });
      }

      delete pendingThreads[senderID];
    }
  } else {
    try {
      const pendingThreadsList = await getPendingThreads(api);
      if (pendingThreadsList.length > 0) {
        const pendingListMessage = generatePendingListMessage(pendingThreadsList);
        api.sendMessage(pendingListMessage, threadID);
        pendingThreads[senderID] = pendingThreadsList;
      } else {
        api.sendMessage('There are no pending threads.', threadID);
      }
    } catch (error) {
      console.error(error);
      api.sendMessage('An error occurred while fetching the pending threads.', threadID);
    }
  }
}

async function getPendingThreads(api) {
  const spamThreads = await api.getThreadList(100, null, ['OTHER']);
  const pendingThreads = await api.getThreadList(100, null, ['PENDING']);
  const allThreads = [...spamThreads, ...pendingThreads];
  const pendingThreadsList = allThreads
    .filter((thread) => thread.isSubscribed && thread.isGroup)
    .map((thread) => ({ threadID: thread.threadID, action: 'accept' }));
  return pendingThreadsList;
}

function generatePendingListMessage(pendingThreadsList) {
  let message = 'List of pending threads:\n';
  pendingThreadsList.forEach((thread, index) => {
    message += `${index + 1}. ThreadID: ${thread.threadID}\n`;
  });
  message += 'To accept or cancel pending threads, type "pending -accept [number(s)]" or "pending -cancel [number(s)]".';
  return message;
}

module.exports = pendingCommand;
