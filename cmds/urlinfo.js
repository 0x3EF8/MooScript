const https = require('https');

async function urlinfo(event, api) {
  const input = event.body.toLowerCase().trim();
  if (input.startsWith("urlinfo")) {
    const inputArr = input.split(" ");
    const url = inputArr.length > 1 ? input.slice(8) : '';

    if (inputArr.length > 1 && inputArr[1] == '-help') {
      const usage = "Usage: urlinfo [url]\n\n";
      const description = "Description: Retrieves information about a URL.\n\n";
      const example = "Example: urlinfo https://example.com\n\n";
      const note = "Note: Make sure to include the complete URL starting with the protocol (e.g., https://).\n";

      const message = usage + description + example + note;
      api.sendMessage(message, event.threadID);
      return;
    }

    const encodedUrl = encodeURIComponent(url);

    const apiUrl = `https://ipqualityscore.com/api/json/url/ToklB8lkDC68k381PfAytc7MYLnsSjIl/${encodedUrl}`;

    try {
      const response = await new Promise((resolve, reject) => {
        https.get(apiUrl, (res) => {
          let rawData = '';
          res.on('data', (chunk) => {
            rawData += chunk;
          });
          res.on('end', () => {
            resolve(rawData);
          });
        }).on('error', (error) => {
          reject(error);
        });
      });

      const data = JSON.parse(response);
      const message = `URL Information:
-------------------------------------------
⌘ URL: ${data.url}
⌘ Domain: ${data.domain}
⌘ IP address: ${data.ip_address}
⌘ Country code: ${data.country_code}
⌘ Language code: ${data.language_code}
⌘ Server: ${data.server}
⌘ Content type: ${data.content_type}
⌘ Status code: ${data.status_code}
⌘ Page size: ${data.page_size}
⌘ Domain rank: ${data.domain_rank}
⌘ DNS valid: ${data.dns_valid}
⌘ Parked domain: ${data.parking}
⌘ Spamming: ${data.spamming}
⌘ Malware: ${data.malware}
⌘ Phishing: ${data.phishing}
⌘ Suspicious: ${data.suspicious}
⌘ Adult content: ${data.adult}
⌘ Risk score: ${data.risk_score}
⌘ Domain age: ${data.domain_age.human}
⌘ Category: ${data.category}
⌘ Redirected: ${data.redirected}
⌘ Request ID: ${data.request_id}`;

      api.sendMessage(message, event.threadID);
    } catch (error) {
      console.error(error.message);
      api.sendMessage("Error getting URL information. Please try again later.", event.threadID);
    }
  }
}

module.exports = urlinfo;
