async function kick(event, api) {
  const input = event.body.toLowerCase().split(' ');

  if (input.includes('-help')) {
    const usage = "Usage: kick\n\n" +
      "Description: Kicks a user from the group or all participants from the group.\n\n" +
      "Options:\n" +
      "-all: Kicks all participants from the group. Bot will also leave the group.\n\n" +
      "Examples:\n" +
      "1. Kick a user by mentioning:\n" +
      "   kick @username\n" +
      "2. Kick a user by replying to their message:\n" +
      "   kick (reply to the user's message)\n" +
      "3. Kick all participants from the group and bot leaves:\n" +
      "   kick -all\n\n" +
      "Note: You need VIP access to use this command.";

    api.sendMessage(usage, event.threadID);
    return;
  }

  const botUserID = api.getCurrentUserID();

  if (input.includes('-all')) {
    api.getThreadInfo(event.threadID, async (err, gc) => {
      if (err) {
        console.error(err);
        api.sendMessage("⚠️ Failed to retrieve group information.", event.threadID);
        return;
      }

      const participantIDs = gc.participantIDs.filter(id => id !== botUserID);

      if (participantIDs.length === 0) {
        api.sendMessage("No participants found in the group.", event.threadID);
        return;
      }

      const kickedUserNames = [];

      for (const participantID of participantIDs) {
        try {
          await api.removeUserFromGroup(participantID, event.threadID);
          const userInfo = await api.getUserInfo(participantID);
          const userName = userInfo[participantID].name || "Unknown User";
          kickedUserNames.push(userName);
        } catch (err) {
          console.error(err);
        }
      }

      try {
        await api.removeUserFromGroup(botUserID, event.threadID);
        const kickedUserList = kickedUserNames.length > 0 ? kickedUserNames.join(', ') : "None";
        api.sendMessage(`All participants have been kicked from the group. Kicked users: ${kickedUserList}. Bot has left the group.`, event.threadID);
      } catch (err) {
        console.error(err);
        api.sendMessage("⚠️ Failed to leave the group.", event.threadID);
      }
    });
  } else if (event.type === "message_reply") {
    const messageReplyId = event.messageReply.messageID;
    const targetUserID = event.messageReply.senderID;

    api.removeUserFromGroup(targetUserID, event.threadID, (err) => {
      if (err) {
        console.error(err);
        api.sendMessage("⚠️ Failed to kick the user.", event.threadID);
      } else {
        api.unsendMessage(messageReplyId);
        api.sendMessage("The user has been kicked from the group.", event.threadID);
      }
    });
  } else if (Object.keys(event.mentions).length !== 0) {
    const targetUserID = Object.keys(event.mentions)[0];

    api.removeUserFromGroup(targetUserID, event.threadID, (err) => {
      if (err) {
        console.error(err);
        api.sendMessage("⚠️ Failed to kick the user.", event.threadID);
      } else {
        api.sendMessage("The user has been kicked from the group.", event.threadID);
      }
    });
  } else {
    api.sendMessage("Invalid command format. Use 'kick -help' for more info.", event.threadID);
  }
}

module.exports = kick;
