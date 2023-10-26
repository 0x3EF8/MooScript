async function uid(event, api) {
  const input = event.body.toLowerCase();

  if (input.includes('-help')) {
    const usage = "Usage: uid\n\n" +
      "Description: Retrieves the Facebook UID of the mentioned user or the user who triggered the command.\n\n" +
      "Example: uid\nExample with mention: uid @username\n\n" +
      "Note: If no mention is provided, it will retrieve the UID of the user who triggered the command.";
    api.sendMessage(usage, event.threadID, event.messageID);
    return;
  }

  let targetUserID = event.type === "message" ? Object.keys(event.mentions).length !== 0 ? Object.keys(event.mentions)[0] : event.senderID : event.messageReply.senderID;

  try {
    const targetUserInfo = await api.getUserInfo(targetUserID);
    const targetUserName = targetUserInfo[targetUserID].name || targetUserInfo[targetUserID].firstName || "Unknown User";
    const targetUserIDString = targetUserID || "Unknown UID";

    await api.sendMessage({
      body: `User: ${targetUserName}\nUID: ${targetUserIDString}`,
      mentions: [{ tag: targetUserName, id: targetUserID }]
    }, event.threadID, event.messageID);
  } catch (err) {
    console.error(err);
    await api.sendMessage("⚠️ Failed to retrieve UID.", event.threadID, event.messageID);
  }
}

module.exports = uid;
