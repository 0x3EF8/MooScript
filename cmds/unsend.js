async function unsend(event, api) {
  if (event.body.includes('-help')) {
    const usage = "Usage: unsend\n\n" +
      "Description: Unsend the message that is being replied to.\n\n" +
      "Note: This command does not require any arguments.";
    api.sendMessage(usage, event.threadID);
    return Promise.resolve();
  }

  if (event.type === "message_reply") {
    const messageReplyId = event.messageReply.messageID;
    api.unsendMessage(messageReplyId);
  }
}

module.exports = unsend;
