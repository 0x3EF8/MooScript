const fs = require('fs');
const request = require('request');
const axios = require('axios');
const path = require('path');
const apiKeysPath = path.join(__dirname, '..', 'json', 'apiKeys.json');
const apiKeys = JSON.parse(fs.readFileSync(apiKeysPath));
async function goai(event, api) {
  const input = event.body.toLowerCase().trim();

  if (input.includes("-help")) {
    const usage = "Usage: goai [prompt]\n\n" +
      "Description: ChatGPT + Bard Artificial Intelligence Combination.\n\n" +
      "Example: goai Generate ikage of cat, ehat is life?\n\n" +
      "Note: The command expects a prompt input.";
    api.sendMessage(usage, event.threadID);
    return;
  }
  try {
  let data = event.body.split(" ");
	let userInfo = await api.getUserInfo(event.senderID);
	userInfo = userInfo[event.senderID]
	if (data.length < 2) {
		return api.sendMessage(
			"Yes?",
			event.threadID,
			event.messageID
		);
	} else {
		data.shift();
		let msg = data.join(" ");
    
		const headers = {
			'Authorization': `Bearer ${apiKeys.openai}`,
			'Content-Type': 'application/json'
		};
    const imagePath = path.join(__dirname, '../temp/goai.jpg');
		const body = {
			message: msg,
			firstName: userInfo.firstName,
			lastName: userInfo.name,
			setName: "Hexa",
		};
		let res = await axios.post('https://go-ai.libyzxy0.repl.co/', body, { headers });
		let response = res.data.content;
		const imageUrlPattern = /!\[.*?\]\((.*?)\)/;
		const matches = response.match(imageUrlPattern);
		if (matches && matches.length > 1) {
			const imageUrl = matches[1];
			console.log(imageUrl);
			let txt = response.split('!');
			let file = fs.createWriteStream(imagePath);
			let rqs = request(imageUrl);
			rqs.pipe(file);
			file.on("finish", () => {
				return api.sendMessage({
						body: txt[0],
						attachment: fs.createReadStream(imagePath),
					},
					event.threadID,
					event.messageID
				);
			});
		} else {
			return api.sendMessage(response, event.threadID, event.messageID)
		}
    }

  } catch (error) {
    console.log(error);
    api.sendMessage("Sorry, I could not generate an response at this time.\nPlease try again later.", event.threadID, event.messageID);
  }
}

module.exports = goai;
