const lookup = require('binlookup')();

async function checkBin(event, api) {
  const input = event.body.trim().split(" ");
  if (input.includes("-help")) {
    const usage = "Usage: checkbin [bin]\n\n" +
      "Description: Retrieves information about the provided BIN (Bank Identification Number).\n\n" +
      "Example: checkbin 123456\n\n" +
      "Note: The command fetches details such as the number length, Luhn check result, scheme, type, brand, prepaid status, country information, and bank details if available.";
    api.sendMessage(usage, event.threadID);
    return;
  }

  if (input.length < 2) {
    api.sendMessage("Usage: checkbin [bin]", event.threadID);
    return;
  }

  const bin = input[1];

  lookup(bin).then(data => {
    let response = "";

    response += `Number Length: ${data.number.length}\n`;
    response += `Luhn: ${data.number.luhn}\n`;
    response += `Scheme: ${data.scheme}\n`;
    response += `Type: ${data.type}\n`;
    response += `Brand: ${data.brand}\n`;
    response += `Prepaid: ${data.prepaid}\n`;
    response += `Country Numeric: ${data.country.numeric}\n`;
    response += `Country Alpha2: ${data.country.alpha2}\n`;
    response += `Country Name: ${data.country.name}\n`;
    response += `Country Emoji: ${data.country.emoji}\n`;
    response += `Country Currency: ${data.country.currency}\n`;
    response += `Country Latitude: ${data.country.latitude}\n`;
    response += `Country Longitude: ${data.country.longitude}\n`;

    if (data.bank) {
      response += `Bank Name: ${data.bank.name}\n`;
      response += `Bank URL: ${data.bank.url}\n`;
      response += `Bank Phone: ${data.bank.phone}\n`;
      response += `Bank City: ${data.bank.city}\n`;
    }

    api.sendMessage(response, event.threadID, event.messageID);
  }).catch(err => {
    api.sendMessage(`Failed to fetch BIN data. Error: ${err.message}`, event.threadID, event.messageID);
  });
}

module.exports = checkBin;
