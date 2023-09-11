const axios = require('axios');

async function tempmail(event, api) {
  const input = event.body;
  const data = input.split(" ");

  if (input.includes('-help')) {
    const usage = "Usage:\n" +
      "Tempmail -gen [tag]: Generates a unique email address with the provided tag.\n" +
      "Tempmail -check: Retrieves the emails received in the past 2 hours from the TestMail API.\n\n" +
      "Examples:\n" +
      "Tempmail -gen mytag\n" +
      "Tempmail -check\n\n" +
      "Note: The tag can be any alphanumeric value for generating an email address.";
    api.sendMessage(usage, event.threadID);
    return;
  }

  if (input.includes("-gen")) {
    const tag = data[2];
    if (!tag) {
      await api.sendMessage("⚠️ Please provide a tag for the email address. Use -gen [tag]", event.threadID);
      return;
    }
    const email = `d8h98.${tag}@inbox.testmail.app`;
    await api.sendMessage(`📧 Your unique email address is: ${email}`, event.threadID);
  } else if (input.includes("-check")) {
    const APIKEY = "e2298007-6128-46be-a787-088262816000";
    const NAMESPACE = "d8h98";
    const apiUrl = `https://api.testmail.app/api/json?apikey=${APIKEY}&namespace=${NAMESPACE}&pretty=true`;

    try {
      const response = await axios.get(apiUrl);
      const emails = response.data.emails.filter((email) => Date.now() - email.timestamp <= 2 * 60 * 60 * 1000);
      const count = emails.length;
      let message = `✉️ You have ${count} emails:\n\n`;

      emails.forEach((email) => {
        const subject = email.subject;
        const from = email.from;
        const date = new Date(email.timestamp).toLocaleString("en-US", { timeZone: "Asia/Manila" });
        const text = email.text || email.html;
        const to = email.to;
        const id = email.id;
        const downloadUrl = email.downloadUrl;
        const attachments = email.attachments;
        let attachmentMsg = "";

        if (attachments.length > 0) {
          attachmentMsg += "\n📎 Attachment:";
          attachments.forEach((attachment) => {
            attachmentMsg += `\n📁 Filename: ${attachment.filename}\n📂 Type: ${attachment.contentType}\n🗂️ Filesize: ${attachment.size}\n⬇️ Download Url: ${attachment.downloadUrl}`;
          });
        }

        message += `📬 From: ${from}\n✉️ To: ${to}\n📅 Date: ${date}\n📧 Subject: ${subject}\n📜 Message:\n\n${text}${attachmentMsg}\n\n`;
      });

      message = message.trim();
      await api.sendMessage(message, event.threadID);
    } catch (error) {
      console.error(error);
      await api.sendMessage("❌ Failed to retrieve emails", event.threadID);
    }
  } else {
    await api.sendMessage("⚠️ Invalid command! Use -help for command usage.", event.threadID);
  }
}

module.exports = tempmail;
