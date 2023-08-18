const path = require("path");
const fs = require("fs");

async function restart(event, api) {
    const filePath = path.join(__dirname, "..", "json", "userpanel.json");
    const items = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const vips = items.userpanel.VIPS;
    const senderID = event.senderID;
    const input = event.body.toLowerCase().split(" ");

    if (!vips.includes(senderID)) {
        api.sendMessage("⛔️ Access Denied. You lack the necessary permissions to utilize this command.", event.threadID);
        return;
    }

    api.sendMessage("⚙️ Restarting system...", event.threadID);
    setTimeout(() => {
        api.sendMessage("✅ System restart complete. The system is now back online.", event.threadID);
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    }, 4000);
}

module.exports = restart;
