const { PasteClient, Publicity } = require("pastebin-api");

async function pastebin(event, api) {
  if (event.body.includes('-help')) {
    const usage = "Usage: pastebin [expiredate] [text]\n\n" +
      "Description: Uploads a paste to Pastebin with an expiration date.\n\n" +
      "Example: pastebin 1D This is a sample paste\n\n" +
      "Note: The command expects an expiration date (N, 10M, 1H, 1D, 1W, 2W, 1M, 6M, 1Y) and the text to upload.";
    api.sendMessage(usage, event.threadID);
    return;
  }

  const client = new PasteClient("9VTprhY4mTgpLwhKJlyx3XbM7i6wz-73");
  const text = event.body.substring(9);
  const data = text.split(" ");
  const message = text.substring(text.indexOf(" ") + 1);
  let expiredate;
  let expiredatename;

  if (data.length < 2) {
    api.sendMessage(`Invalid use of command!\npastebin <expiredate> <any text>\nExample: pastebin 1D Your paste text here`, event.threadID);
  } else {
    try {
      const validExpirationDate = ["N", "10M", "1H", "1D", "1W", "2W", "1M", "6M", "1Y"];
      if (validExpirationDate.includes(data[0].toUpperCase())) {
        expiredate = data[0].toUpperCase();
        expiredatename = {
          N: "Never Expiry",
          "10M": "10 Minutes",
          "1H": "1 Hour",
          "1D": "1 Day",
          "1W": "1 Week",
          "2W": "2 Weeks",
          "1M": "1 Month",
          "6M": "6 Months",
          "1Y": "1 Year",
        }[expiredate];
        const url = await client.createPaste({
          code: message,
          expireDate: expiredate,
          format: "javascript",
          name: "HexClanPH",
          publicity: Publicity.Public,
        });
        api.sendMessage("Pastebin URL:\n" + url + "\nExpiry: " + expiredatename, event.threadID, event.messageID);
      } else {
        api.sendMessage("Invalid expiry date! Valid expiration dates: N, 10M, 1H, 1D, 1W, 2W, 1M, 6M, 1Y (case insensitive)", event.threadID);
      }
    } catch (err) {
      api.sendMessage(err, event.threadID);
    }
  }
}

module.exports = pastebin;
