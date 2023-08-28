const axios = require('axios');

async function sim(event, api) {
  const input = event.body;
  let data = input.split(" ");

  if (data.length < 2) {
    api.sendMessage("⚠️ Invalid Use Of Command!\nUsage: sim + <query>", event.threadID, event.messageID);
    return;
  }

  data.shift();

  try {
    const response = await axios.get("https://api.simsimi.net/v2/?text=" + data.join(" ") + "&lc=en&cf=false&name=aika");
    api.sendMessage(response.data["success"], event.threadID, event.messageID);
  } catch (err) {
    api.sendMessage(`${err.message}`, event.threadID);
  }
}

module.exports = sim;
