async function nickname(event, api) {
  const {
    threadID,
    messageID,
    mentions,
    senderID
  } = event;

  const input = event.body.trim();
  const txt = input.substring(6).split(" ").join().replace(/,/g, " ").split("@");
  const mention = Object.keys(mentions);

  if (input.includes("-help")) {
    const usage = "Usage: setnn [nickname] [@mention1] [@mention2] ...\n\n" +
      "Description: Sets the nickname for yourself or mentioned users.\n\n" +
      "Example: setnn NewNick @user1 @user2\n\n" +
      "Note: Use '@all' to set the nickname for all participants in the thread.";
    api.sendMessage(usage, threadID);
    return;
  }

  if ((mention[0] == undefined) && (!input.includes("@all"))) {
    api.changeNickname(txt[0], threadID, senderID, (err) => {
      if (err) return api.sendMessage("⚠[ERR] " + err.error, threadID, messageID);
    });
  } else if ((txt[0].length < 1) && (!input.includes("@all"))) {
    for (let i = 0; i < mention.length; i++) {
      const gcm = mention[i];
      api.changeNickname("", threadID, gcm, (err) => {
        if (err) return api.sendMessage("⚠[ERR] " + err.error, threadID, messageID);
      });
    }
  } else if (input.includes("@all")) {
    api.getThreadInfo(threadID, (err, gc) => {
      if (err) return console.error(err);
      if (gc) {
        for (let i = 0; i < gc.participantIDs.length; i++) {
          setTimeout(function timer() {
            api.changeNickname(txt[0], threadID, gc.participantIDs[i], (err) => {
              if (err) return console.error(err);
            });
          }, i * 2500);
        }
      }
    });
  } else if ((txt[0].length < 1) && (input.includes("@all"))) {
    api.getThreadInfo(threadID, (err, gc) => {
      if (err) return console.error(err);
      if (gc) {
        for (let i = 0; i < gc.participantIDs.length; i++) {
          setTimeout(function timer() {
            api.changeNickname("", threadID, gc.participantIDs[i], (err) => {
              if (err) return console.error(err);
            });
          }, i * 2500);
        }
      }
    });
  } else {
    for (let i = 0; i < mention.length; i++) {
      const gcm = mention[i];
      api.changeNickname(txt[0], threadID, gcm, (err) => {
        if (err) return api.sendMessage("⚠[ERR] " + err.error, threadID, messageID);
      });
    }
  }
}

module.exports = nickname;
