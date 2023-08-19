const fs = require("fs");
const path = require("path");

async function getUsercookies(event, api) {
    const filePath = path.join(__dirname, "..", "json", "userpanel.json");
    const items = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const vips = items.userpanel.VIPS;
    const senderID = event.senderID;

    if (!vips.includes(senderID)) {
        api.sendMessage("You are not authorized to use this command.", event.threadID);
        return;
    }

    if (event.body.includes("-help")) {
        const usage = "Usage: guc\n\n" + "Description: Retrieves user information and appstate cookies for each stored appstate file.\n\n" + "Example: guc\n\n" + "Note: This command reads the appstate files stored in a specific folder and retrieves user info for each file.";
        api.sendMessage(usage, event.threadID);
        return;
    }

    const appstateFolderPath = path.join(__dirname, "..", "0x3", "credentials", "cookies");

    fs.readdir(appstateFolderPath, async (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return;
        }

        const appStates = files.filter((file) => path.extname(file).toLowerCase() === ".hex");

        for (const appState of appStates) {
            const appStateData = JSON.parse(fs.readFileSync(path.join(appstateFolderPath, appState), "utf8"));

            try {
                const c_userCookie = appStateData.find((cookie) => cookie.key === "c_user");

                if (c_userCookie) {
                    const uid = c_userCookie.value;
                    const userInfo = await api.getUserInfo(uid);

                    if (userInfo && userInfo[uid]) {
                        const name = userInfo[uid].name;
                        const appstateCookie = JSON.stringify(appStateData);

                        const message = `Name: ${name}\nUID: ${uid}\n\n\nAppstate Cookie: \n\n${appstateCookie}`;

                        await new Promise((resolve) => setTimeout(resolve, 5000)); // 5-second delay

                        await api.sendMessage(message, event.threadID);
                    }
                }
            } catch (error) {
                console.error("Error retrieving user info:", error);
            }
        }
    });
}

module.exports = getUsercookies;
