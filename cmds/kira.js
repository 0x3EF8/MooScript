const axios = require('axios');
const cheerio = require('cheerio');

async function chatGPTCommand(event, api) {
  const response = await axios.get('https://chatgpt.ai/');
  const $ = cheerio.load(response.data);
  const nonce = $('[data-nonce]').attr('data-nonce');
  const post_id = $('[data-post-id]').attr('data-post-id');
  const bot_id = $('[data-bot-id]').attr('data-bot-id');

  const headers = {
    'authority': 'chatgpt.ai',
    'origin': 'https://chatgpt.ai',
    'pragma': 'no-cache',
    'referer': 'https://chatgpt.ai/gpt-4/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  };
  
  const data = new URLSearchParams();
  data.append('_wpnonce', nonce);
  data.append('post_id', post_id);
  data.append('url', 'https://chatgpt.ai/gpt-4');
  data.append('action', 'wpaicg_chat_shortcode_message');
  data.append('message', event.body);
  data.append('bot_id', bot_id);

  try {
    const response = await axios.post('https://chatgpt.ai/wp-admin/admin-ajax.php', data, { headers });
    const responseData = response.data;
    
    if (responseData && responseData.data) {
      api.sendMessage(responseData.data, event.threadID, event.messageID);
    } else {
      api.sendMessage("No response from the AI.", event.threadID);
    }
  } catch (error) {
    api.sendMessage("An error occurred while interacting with the AI.", event.threadID);
  }
}

module.exports = chatGPTCommand;
 