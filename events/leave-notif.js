module.exports = async ({ api, event }) => {
  try {
  let userInfo = await api.getUserInfo(event.logMessageData.leftParticipantFbId);
  userInfo = userInfo[event.logMessageData.leftParticipantFbId];
  let gcInfo = await api.getThreadInfo(event.threadID);
  if (event.author == event.logMessageData.leftParticipantFbId) {
    api.sendMessage(
      {
        body: `${userInfo.name} has left to ${gcInfo.threadName}!`,
      },
      event.threadID
    );
  } else {
    api.sendMessage(
      {
        body: `${userInfo.name} has kicked to ${gcInfo.threadName}!`,
      },
      event.threadID
    );
  }
 } catch (err) {
 	api.sendMessage(`${err}`, event.threadID);
 } 
};