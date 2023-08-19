const fs = require("fs");

function collectuid(event, api) {
    const threadID = event.threadID;

    api.getThreadInfo(threadID, (err, gc) => {
        if (err) {
            console.error(err);
            return;
        }

        if (gc) {
            const uids = gc.participantIDs;
            const count = uids.length;
            const data = JSON.stringify(uids, null, 2);

            fs.writeFile("./json/uids.json", data, (err) => {
                if (err) {
                    console.error("Error writing collected user IDs:", err);
                    return;
                }
                console.log("Collected user IDs saved successfully.");

                api.sendMessage(`[SUCCESS] User IDs collected: ${count}.`, threadID);
            });
        }
    });
}

module.exports = collectuid;
