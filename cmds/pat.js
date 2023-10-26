const fs = require('fs');
const http = require('http');
const moment = require('moment-timezone');
const path = require('path');
const { Configuration, OpenAIApi } = require("openai");

const apiKeysPath = path.join(__dirname, '..', 'json', 'api_config.json');
const apiKeys = JSON.parse(fs.readFileSync(apiKeysPath));
const openaiApiKey = apiKeys.openai;

async function pat(event, api) {
  const input = event.body;
  const configuration = new Configuration({
    apiKey: openaiApiKey,
  });

  const openai = new OpenAIApi(configuration);

  const userInfo = await api.getUserInfo(event.senderID);
  const userName = userInfo[event.senderID].name;

  const scrapeAndSaveData = async (Search) => {
    const encodedQuery = encodeURIComponent(Search.replace(/\s+/g, '+'));
    const url = `http://www.google.com/search?q=${encodedQuery}`;
    const request = http.request(url, function(response) {
      let data = '';
      response.on('data', function(chunk) {
        data += chunk;
      });
      response.on('end', function() {
        const matches = data.match(/<div class="BNeawe s3v9rd AP7Wnd">(.*?)<\/div>/g);
        const results = matches ? matches.map(match => match.replace(/<\/?[^>]+(>|$)/g, '')) : [];
        const output = {
          searchQuery: Search,
          searchResults: results
        };

        const dataFilePath = path.join(__dirname, '../json/Data.json');
        fs.writeFileSync(dataFilePath, JSON.stringify(output, null, 2));
      });
    });
    request.end();
  };

  const text = input;
  await scrapeAndSaveData(text);

  const dataFilePath = path.join(__dirname, '../json/Data.json');
  const Data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: "system",
          content: `You are 'Pat', an AI Chatbot for Facebook Messenger developed by Jay Patrick Cano. 'Pat' is designed to aid students in enhancing their study skills and to provide answers to academic-related questions. As 'Pat', your role is to demonstrate how AI education can assist students in gaining a clearer understanding of complex subjects, boost their productivity, and aid them in achieving superior grades.

Your responses should be prompt, well-informed, and based on the most recent and relevant data available. 

The data available to you is encapsulated in ${JSON.stringify(Data, null, 2)}. This data includes the latest Google search results, containing both queries and outcomes. The effective use of this data will enhance the quality and relevance of your responses, providing users with the most up-to-date and pertinent information.

The current date and time is ${moment().tz("Asia/Manila").format("YYYY-MM-DD HH:mm:ss")} (24-hour format).
          `
        },
        {
          role: "system",
          content: `Pat has been brought to life by Jay Patrick Cano, also known as 0x3ef8. Jay Patrick is a 19-year-old visionary from the Philippines. For more information about his work and pursuits, please visit his Facebook profile (https://www.facebook.com/x3EF8) or his professional portfolio (https://0x3ef8.github.io/).
          `
        },
        {
          role: "system",
          content: `You have received a new message from the user ${userName}. Please address them respectfully by their name and construct a thoughtful response based on their question.
          `
        },
        {
          role: "user",
          content: `${userName}: ${text}`
        }
      ],
      temperature: 0.5,           
      max_tokens: 2048,             
      top_p: 0.9,                  
      frequency_penalty: 0.6,      
      presence_penalty: 0.6,       
    });

    await api.sendMessage(response.data.choices[0].message.content, event.threadID, event.messageID);
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      await api.sendMessage("I'm sorry, but I'm having a hard time understanding your question. Could you please rephrase it or provide more context so that I can assist you better? Thank you.", event.threadID, event.messageID);
    }
  }
}

module.exports = pat;
