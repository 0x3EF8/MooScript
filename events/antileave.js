const fs = require('fs').promises;
const path = require('path');

async function handleAL(api, event) {
  const settingsPath = path.join(__dirname, '..', 'json', 'settings.json');
  
  try {
    const settingsData = await fs.readFile(settingsPath, 'utf8');
    const settings = JSON.parse(settingsData);

    if (settings && settings[0] && settings[0].antileave === true) {
      if (event.logMessageType === 'log:unsubscribe') {
        const userId = event.logMessageData.leftParticipantFbId;

        api.getThreadInfo(event.threadID, (err, gc) => {
          if (err) {
            console.error(err);
            return;
          }

          api.getUserInfo(parseInt(userId), (err, data) => {
            if (err) {
              console.error(err);
              return;
            }

            const user = data[userId];
            if (user) {
              const userName = user.name;

              setTimeout(() => {
                api.addUserToGroup(parseInt(userId), event.threadID, (err) => {
                  if (err) {
                    console.error(err);
                    return;
                  }

                  api.sendMessage(
                    {
                      body: `@${userName} successfully reinstated to the group.`,
                      mentions: [
                        {
                          tag: `@${userName}`,
                          id: userId,
                        },
                      ],
                    },
                    event.threadID
                  );
                });
              }, 5000);
            }
          });
        });
      }
    }
  } catch (error) {
    console.error('Error reading settings:', error);
  }
}

module.exports = handleAL;
