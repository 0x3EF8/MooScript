const axios = require('axios');
const FormData = require('form-data');

async function gptgoCommand(event, api) {
  const input = event.body.toLowerCase().trim();

  if (input.includes("-help")) {
    const usage = "Usage: gptgo [query]\n\n" +
      "Description: Generates AI-generated text based on the provided query.\n\n" +
      "Example: gptgo Tell me a joke.";
    api.sendMessage(usage, event.threadID);
    return;
  }

  const query = input.slice(6);
  const opts = { proxy: true }; // Adjust this option based on your needs

  try {
    const response = await gptgo(query, opts);
    api.sendMessage(response, event.threadID, event.messageID);
  } catch (error) {
    console.log(error);
    api.sendMessage("An error occurred while generating AI-generated text.", event.threadID, event.messageID);
  }
}

async function gptgo(q, opts) {
  if (!opts) opts.proxy = false;
  let ua = {
    'user-agent': 'Mozilla/5.0 (Linux; Android 8.1.0; vivo 1811) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.40 Mobile Safari/537.36'
  };
  let baseUrl = 'https:/\/gptgo.ai';
  
  if (opts.proxy === false) {
    return new Promise((res, rej) => {
      axios.get(`${baseUrl}/action_get_token.php?q=${q}&hlgpt=en&hl=en`, {
        headers: ua
      }).then(r => {
        axios.get(`${baseUrl}/action_ai_gpt.php?token=${r.data.token}`, {
          headers: ua
        }).then(R => {
          let arr = R.data.match(/"content":"(.*?)"/g).splice(1);
          arr.pop();
          res(arr.join().match(/:"(.*?)"/g).map(e => e.replace(/[:"]/g, '')).join(''));
        }).catch(e => rej(e.response.data));
      }).catch(e => rej(e.response.data));
    });
  } else if (opts.proxy === true) {
    let form1 = new FormData();
    form1.append('url', `${baseUrl}/action_get_token.php?q=${q}&hlgpt=en&hl=en`);
    let html1 = await axios({
      method: "post",
      url: "https:/\/zend2.com/index.php",
      data: form1,
      headers: {
        "user-agent": ua['user-agent'],
        "Content-Type": "multipart/form-data"
      }
    });
    let token = JSON.parse(html1.data.split("\n")[html1.data.split("\n").length - 1]).token;
    let form2 = new FormData();
    form2.append('url', `${baseUrl}/action_ai_gpt.php?token=${token}`);
    let html2 = await axios({
      method: "post",
      url: "https:/\/zend2.com/index.php",
      data: form2,
      headers: {
        "user-agent": ua['user-agent'],
        "Content-Type": "multipart/form-data"
      }
    });
    let arr = html2.data.match(/"content":"(.*?)"/g).splice(1);
    arr.pop();
    return arr.join().match(/:"(.*?)"/g).map(e => e.replace(/[:"]/g, '')).join('');
  }
}

module.exports = gptgoCommand;
