const axios = require('axios');
const fs = require('fs');
const path = require('path');

let sessionId, cookies;

class BardAI {
  constructor(cookie) {
    try {
      this.cookie = cookie;
    } catch (e) {
      throw new Error("Session Cookies are missing, Unable to login to an account!");
    }
  }

  async login() {
    if (!this.cookie) throw new Error('Error logging into your account, session cookies are missing.');
    else {
      cookies = this.cookie;
      let headerParams = {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "Cookie": `__Secure-1PSID=${this.cookie};`
      };
      let instance = axios.create({
        withCredentials: true,
        baseURL: "https://bard.google.com/",
        headers: headerParams
      });
      return instance.get().then(r => {
        try {
          sessionId = r.data.match(/SNlM0e":"(.*?)"/g)[0].substr(8).replace(/\"/g, '');
        } catch (e) {
          throw new Error('Unable to login to your account. Please try to use new cookies and try again.');
        }
      });
    }
  }
}

let formatMarkdown = (text, images) => {
  if (!images) return text;
  for (let imageData of images) {
    const formattedTag = `!${imageData.tag}(${imageData.url})`;
    text = text.replace(new RegExp("(?<!\\!)" + imageData.tag.replace("[", "\\[").replace("]", "\\]")), formattedTag);
  }
  return text;
};

let chat = async (message) => {
  if (!sessionId) throw new Error('Please initialize login first to use Bard AI.');
  let postParamsStructure = [
    [message],
    null,
    []
  ];
  let postData = {
    "f.req": JSON.stringify([null, JSON.stringify(postParamsStructure)]),
    at: sessionId
  };
  let headerParams = {
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    "Cookie": `__Secure-1PSID=${cookies};`
  };
  return axios({
    method: 'POST',
    url: 'https://bard.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=boq_assistant-bard-web-server_20230711.08_p0&_reqID=0&rt=c',
    headers: headerParams,
    withCredentials: true,
    data: postData
  }).then(r => {
    let bardAIRes = JSON.parse(r.data.split("\n")[3])[0][2];
    if (!bardAIRes) throw new Error(`Bard AI encountered an error ${r.data}.`);
    let bardData = JSON.parse(bardAIRes);
    let bardAI = JSON.parse(bardAIRes)[4][0];
    let result = bardAI[1][0];
    let images = bardAI[4]?.map(e => {
      return {
        url: e[3][0][0],
        tag: e[2],
        source: {
          name: e[1][1],
          original: e[0][0][0],
          website: e[1][0][0],
          favicon: e[1][3]
        }
      };
    });
    return formatMarkdown(result, images);
  });
};

async function bardCommand(event, api) {
  try {
    const bardPath = path.join(__dirname, '..', 'json', 'api_config.json');
    const apiConfig = JSON.parse(fs.readFileSync(bardPath));
    
    if (apiConfig.bard_cookies && apiConfig.bard_cookies.length > 0) {
      const bardCookie = apiConfig.bard_cookies[0].value;
      let bard = new BardAI(bardCookie);
      await bard.login();
      const response = await chat(event.body);
      const imageUrlPattern = /!\[.*?\]\((.*?)\)/;
      const matches = response.match(imageUrlPattern);

      if (matches && matches.length > 1) {
        const imageUrl = matches[1];
        const txt = response.split('!');

        const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
        api.sendMessage({
          body: txt[0],
          attachment: imageResponse.data, 
        }, event.threadID, event.messageID);
      } else {
        api.sendMessage(response, event.threadID, event.messageID);
      }
    } else {
      api.sendMessage('Bard cookies are missing in api_config.json. Please add them and try again.', event.threadID, event.messageID);
    }
  } catch (error) {
    console.error('Error:', error.message);
    api.sendMessage('An error occurred while using Bard AI. Please try again later.', event.threadID, event.messageID);
  }
}

module.exports = bardCommand;
