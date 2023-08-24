const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
const path = require("path");
const apiKeysPath = path.join(__dirname, "..", "json", "apiKeys.json");
const apiKeys = JSON.parse(fs.readFileSync(apiKeysPath));
const openaiApiKey = apiKeys.openai;

async function mj(event, api) {
    try {
        let res = await axios.post("http://project-orion.mrepol742.repl.co/chat",  {
            body: event.body,
            length: event.attachments.length,
            guid: event.threadID,
            uid: event.senderID,
            font: true,
            api: openaiApiKey
        });
        api.sendMessage(res.data);
    } catch (err) {
        console.error(error);
        api.sendMessage("🛠️ An error occurred while processing your request. Please try again later.", event.threadID, event.messageID);
    }
}

module.exports = mj;
