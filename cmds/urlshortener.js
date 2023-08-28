const axios = require('axios');

async function urlshortener(event, api) {
  if (event.body.includes('-help')) {
    const usage = "Usage: urlshortener <link>\n\n" +
      "Description: Shorten a URL using a URL shortener service.\n\n" +
      "Example: urlshortener https://example.com";
    api.sendMessage(usage, event.threadID);
    return Promise.resolve();
  }

  if (event.body.split(" ").length < 2) {
    api.sendMessage(`Invalid use of command!\nPrefix + urlshortener <link>`, event.threadID);
  } else {
    var text = event.body.substring(13);
    const encodedParams = new URLSearchParams();
    encodedParams.append("url", text);
    const options = {
      method: "POST",
      url: "https://url-shortener-service.p.rapidapi.com/shorten",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "X-RapidAPI-Host": "url-shortener-service.p.rapidapi.com",
        "X-RapidAPI-Key": "04357fb2e1msh4dbe5919dc38cccp172823jsna0869f87acc3",
      },
      data: encodedParams,
    };
    try {
      const response = await axios.request(options);
      console.log(response.data.result_url);
      api.sendMessage("Shortened Url: " + response.data.result_url, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = urlshortener;
