const path = require("path");
const fs = require("fs");

async function notify(event, api) {
    const filePath = path.join(__dirname, "..", "json", "userpanel.json");
    const items = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const vips = items.userpanel.VIPS;
    const senderID = event.senderID;
    const input = event.body.toLowerCase().split(" ");

    if (!vips.includes(senderID)) {
        api.sendMessage("🚫 Access Denied. You lack the necessary permissions to utilize this command.", event.threadID);
        return;
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));

    try {
        const message = event.body.split(" ").slice(1).join(" ");

        if (!message) {
            await api.sendMessage("Missing message. Please provide a message to send to all users.", event.threadID);
            return;
        }

        const list = await api.getThreadList(200, null, ["INBOX"]);

        const formattedMessage = formatMessage(message);

        let userCount = 0;
        let groupCount = 0;

        const batchSize = 50;
        const delayBetweenBatches = 10000;
        const delayBetweenMessages = 10000;

        for (let i = 0; i < list.length; i += batchSize) {
            const batch = list.slice(i, i + batchSize);

            const promises = batch.map((info, index) => {
                if (info.isSubscribed) {
                    return new Promise(async (resolve) => {
                        await new Promise((resolve) => setTimeout(resolve, delayBetweenMessages * index));
                        await api.sendMessage({ body: formattedMessage }, info.threadID);

                        if (info.isGroup) {
                            groupCount++;
                        } else {
                            userCount++;
                        }

                        resolve();
                    });
                }
            });

            await Promise.all(promises);
            await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
        }

        const outputMessage = `Your message has been sent to all ${userCount} users and ${groupCount} groups.`;
        await api.sendMessage(outputMessage, event.threadID);
    } catch (err) {
        console.error("Failed to send message:", err);
        await api.sendMessage("Failed to send message to all users.", event.threadID);
    }
}

function formatMessage(message) {
    const dateOptions = {
        timeZone: "Asia/Manila",
        hour12: true,
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
    };
    const currentDate = new Date().toLocaleString("en-US", dateOptions);

    const formattedMessage = `
  ** Message from Hexclan Developers **
  
Date and Time: ${currentDate}

${message}`;

    return formattedMessage;
}

module.exports = notify;
