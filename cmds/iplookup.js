const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require("openai");

const apiKey = "84ee8ffc30644f58a7878d83519ae4dc";

module.exports = async function (event, api) {
  const input = event.body.toLowerCase().split(' ');
  const ipAddress = input[1];

  if (!ipAddress) {
    api.sendMessage('Usage: IPInfo [IP Address]', event.threadID);
    return;
  }

  try {
    const response = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ipAddress}`);

    if (response.status === 200) {
      const data = response.data;

      const formattedResult = `
🤖 Here's what I found for IP address ${ipAddress}:

🌐 𝗜𝗣 𝗔𝗗𝗗𝗥𝗘𝗦𝗦: ${data.ip}
🌍 𝗖𝗢𝗡𝗧𝗜𝗡𝗘𝗡𝗧 𝗖𝗢𝗗𝗘: ${data.continent_code}
🌎 𝗖𝗢𝗡𝗧𝗜𝗡𝗘𝗡𝗧 𝗡𝗔𝗠𝗘: ${data.continent_name}
🌐 𝗖𝗢𝗨𝗡𝗧𝗥𝗬 𝗖𝗢𝗗𝗘2: ${data.country_code2}
🌐 𝗖𝗢𝗨𝗡𝗧𝗥𝗬 𝗖𝗢𝗗𝗘3: ${data.country_code3}
📌 𝗖𝗢𝗨𝗡𝗧𝗥𝗬 𝗡𝗔𝗠𝗘: ${data.country_name}
🏛️ 𝗖𝗢𝗨𝗡𝗧𝗥𝗬 𝗖𝗔𝗣𝗜𝗧𝗔𝗟: ${data.country_capital}
🏞️ 𝗦𝗧𝗔𝗧𝗘/𝗣𝗥𝗢𝗩𝗜𝗡𝗖𝗘: ${data.state_prov}
🌆 𝗖𝗜𝗧𝗬: ${data.city}
📮 𝗭𝗜𝗣𝗖𝗢𝗗𝗘: ${data.zipcode}
🌍 𝗟𝗔𝗧𝗜𝗧𝗨𝗗𝗘: ${data.latitude}
🌍 𝗟𝗢𝗡𝗚𝗜𝗧𝗨𝗗𝗘: ${data.longitude}
🇪🇺 Is EU: ${data.is_eu ? 'Yes' : 'No'}
📞 𝗖𝗔𝗟𝗟𝗜𝗡𝗚 𝗖𝗢𝗗𝗘: ${data.calling_code}
🌐 𝗖𝗢𝗨𝗡𝗧𝗥𝗬 𝗧𝗟𝗗: ${data.country_tld}
🗣️ 𝗟𝗔𝗡𝗚𝗨𝗔𝗚𝗘𝗦: ${data.languages}
🏳️ 𝗖𝗢𝗨𝗡𝗬𝗥𝗬 𝗙𝗟𝗔𝗚: ${data.country_flag}
🌐 𝗚𝗘𝗢𝗡𝗔𝗠𝗘 𝗜𝗗: ${data.geoname_id}
🌐 𝗜𝗦𝗣: ${data.isp}
🌐 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗜𝗢𝗡 𝗧𝗬𝗣𝗘: ${data.connection_type || 'N/A'}
🏢 𝗢𝗥𝗚𝗔𝗡𝗜𝗭𝗔𝗧𝗜𝗢𝗡: ${data.organization}
💰 𝗖𝗨𝗥𝗥𝗘𝗡𝗖𝗬 𝗖𝗢𝗗𝗘: ${data.currency.code}
💰 𝗖𝗨𝗥𝗥𝗘𝗡𝗖𝗬 𝗡𝗔𝗠𝗘: ${data.currency.name}
💰 𝗖𝗨𝗥𝗥𝗘𝗡𝗖𝗬 𝗦𝗬𝗠𝗕𝗢𝗟: ${data.currency.symbol}
🌍 𝗧𝗜𝗠𝗘 𝗭𝗢𝗡𝗘: ${data.time_zone.name}
🕒 𝗢𝗙𝗙𝗦𝗘𝗧: ${data.time_zone.offset}
⏰ 𝗖𝗨𝗥𝗥𝗘𝗡𝗧 𝗧𝗜𝗠𝗘: ${data.time_zone.current_time}
🕒 𝗖𝗨𝗥𝗥𝗘𝗡𝗧 𝗧𝗜𝗠𝗘 (Unix): ${data.time_zone.current_time_unix}
🌞 Is DST: ${data.time_zone.is_dst ? 'Yes' : 'No'}
🌞 𝗗𝗦𝗧 𝗦𝗔𝗩𝗜𝗡𝗚𝗦: ${data.time_zone.dst_savings}

🏠 𝗙𝗨𝗟𝗟 𝗔𝗗𝗗𝗥𝗘𝗦𝗦: ${data.city}, ${data.state_prov}, ${data.country_name}, ${data.zipcode}
🌐 𝗚𝗢𝗢𝗚𝗟𝗘 𝗠𝗔𝗣\n[Open in Google Maps](https://www.google.com/maps?q=${data.latitude},${data.longitude})`;

      api.sendMessage(formattedResult, event.threadID, event.messageID);
    } else {
      api.sendMessage("An error occurred while fetching IP information.", event.threadID, event.messageID);
    }
  } catch (error) {
    console.error(error);
    api.sendMessage("An error occurred while fetching IP information.", event.threadID, event.messageID);
  }
};
