const path = require("path");
const fs = require("fs");

async function addFriendsToGroup(event, api) {
    const filePath = path.join(__dirname, "..", "json", "userpanel.json");
    const items = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const vips = items.userpanel.VIPS;
    const senderID = event.senderID;
    const input = event.body.toLowerCase().split(" ");

    if (!vips.includes(senderID)) {
        api.sendMessage("🚫 Access Denied. You lack the necessary permissions to utilize this command.", event.threadID);
        return;
    }

    if (input.includes("-help")) {
        const usage = "Usage: afg -[groupTitle]\n\n" + "Description: Creates a new group chat and adds the friends of the bot to the group.\n\n" + "Example: afg -this is a test\n\n" + 'Note: The group title must start with a hyphen "-" followed by the title.';
        api.sendMessage(usage, event.threadID);
        return;
    }

    const friendsList = await new Promise((resolve, reject) => {
        api.getFriendsList((err, friendList) => {
            if (err) {
                console.error("Error getting friends list:", err);
                reject(err);
            } else {
                resolve(friendList);
            }
        });
    });

    const friendIDs = friendsList.map((friend) => friend.userID);
    let groupTitle = "";

    const titleIndex = input.findIndex((word) => word.startsWith("-"));
    if (titleIndex !== -1 && titleIndex < input.length) {
        groupTitle = input.slice(titleIndex).join(" ").substring(1);
    }

    api.createNewGroup(friendIDs, groupTitle, (err, threadID) => {
        if (err) {
            console.error("Error creating group chat:", err);
            api.sendMessage("Failed to create the new group chat. Please try again later.", event.threadID);
            return;
        }

        api.getThreadInfo(threadID, (err, groupInfo) => {
            if (err) {
                console.error("Error getting group info:", err);
                api.sendMessage("The new group chat has been created successfully. Group ID: " + threadID, event.threadID);
                return;
            }

            const groupName = groupTitle || groupInfo.name || "Unnamed Group";
            api.sendMessage("The new group chat has been created successfully. Group Name: " + groupName + ", Group ID: " + threadID, event.threadID);
        });
    });
}

module.exports = addFriendsToGroup;
