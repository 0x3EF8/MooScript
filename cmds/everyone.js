function mentionAll(event, api) {
    const threadID = event.threadID;
    const messageID = event.messageID;

    api.getThreadInfo(threadID, (err, gc) => {
        if (err) {
            console.error(err);
            return;
        }

        if (gc) {
            const arr = [];
            for (let i = 0; i < gc.userInfo.length && i < gc.participantIDs.length; i++) {
                const _all2 = gc.userInfo[i].name;
                const _all = gc.participantIDs[i];
                arr.push({
                    id: _all,
                    tag: _all2,
                });
            }

            const sort = JSON.stringify(arr)
                .replace(/\"id":/gi, "")
                .replace(/ /gi, "")
                .replace(/\,\"tag"/gi, "");
            const mentions = JSON.parse(sort);

            const obj = [];
            for (const i in mentions) {
                const x = Object.keys(mentions[i]);
                obj.push({
                    id: x[0],
                    tag: "@" + mentions[i][x],
                });
            }

            let body = "";
            obj.forEach((r) => {
                body += r.tag + " ";
            });

            api.sendMessage(
                {
                    body: body,
                    mentions: obj,
                },
                threadID,
                messageID
            );
        }
    });
}

module.exports = mentionAll;
