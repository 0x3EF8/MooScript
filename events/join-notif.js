const ameClient = require("amethyste-api");
const ameApi = new ameClient(
  "365745f69238ead2e433c23bb9ccd972293d3c9553a25fc31f647b4ae047e5b201bc5d94584dfe3afbd79d233ec8bbc85d2f1d610bf9749ddb97a0915e630040"
);
const fs = require("fs");
module.exports = async ({ api, event }) => {
  if(event.logMessageData.addedParticipants[0].userFbId == api.getCurrentUserID()) {
     return api.sendMessage("", event.threadID, event.messageID);
  } 
  try {
  let userInfo = await api.getUserInfo(event.logMessageData.addedParticipants[0].userFbId);
  userInfo = userInfo[event.logMessageData.addedParticipants[0].userFbId];
  let gcInfo = await api.getThreadInfo(event.threadID);
  let url = `https://graph.facebook.com/${event.logMessageData.addedParticipants[0].userFbId}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
  ameApi
    .generate("challenger", {
      url: url,
    })
    .then((image) => {
      const filePath = path.join(__dirname, '..', 'temp', `removebg.png`);
      fs.writeFile(filePath, image, (err) => {
        if (err) {
          console.error("Error writing file:", err);
          return;
        }
        api.sendMessage(
          {
            body: `Welcome ${userInfo.name} to ${gcInfo.threadName}`, 
            attachment: fs.createReadStream(filePath),
          },
          event.threadID
        );
      });
    })
    .catch((err) => {
      throw err;
    });
 } catch (err) {
    api.sendMessage(`${err}`, event.threadID)
 }
};