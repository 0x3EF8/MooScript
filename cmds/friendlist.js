async function getFriendsList(event, api) {
    const input = event.body.toLowerCase().split(" ");

    if (input.length > 1 && input[1] === "-help") {
        const usage = "Usage: getFriendsList\n\n" + "Description: Returns a list of your friends and their names with IDs.\n\n" + "Example: getFriendsList\n\n" + "Note: This command does not require any additional arguments.";
        api.sendMessage(usage, event.threadID);
        return;
    }

    api.getFriendsList((err, friendList) => {
        if (err) {
            console.error("Error getting friends list:", err);
            api.sendMessage("Failed to retrieve friends list. Please try again later.", event.threadID);
            return;
        }

        const friendInfo = friendList.map((friend) => `${friend.fullName} (${friend.userID})`);
        const outputMessage = `My friends list:\n${friendInfo.join("\n")}`;

        api.sendMessage(outputMessage, event.threadID);
    });
}

module.exports = getFriendsList;
