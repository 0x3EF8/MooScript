const https = require("https");

async function botscope(event, api) {
    const input = event.body;
    const inputArr = input.trim().split(" ");

    if (inputArr.length > 1 && inputArr[1] === "-help") {
        const usage = "Usage: monitor [name] [url]\n\n" + "Description: Adds the specified URL to the monitoring list with the given name.\n\n" + "Example: monitor MyWebsite https://example.com\n\n" + "Note: The monitoring service will periodically check the URL for availability.";
        api.sendMessage(usage, event.threadID);
        return;
    }

    if (inputArr.length < 3) {
        const errorMessage = "ERROR: Please provide a name and URL to add to the monitoring list. Type 'monitor -help' for more information.";
        api.sendMessage(errorMessage, event.threadID);
        return;
    }

    const name = inputArr[1];
    const url = inputArr[2];
    const apiUrl = `https://botscope.iampat404.repl.co/api/ping?name=${encodeURIComponent(name)}&url=${encodeURIComponent(url)}`;

    https
        .get(apiUrl, (response) => {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                const responseData = JSON.parse(data);
                if (responseData.error) {
                    const errorMessage = `ERROR: Failed to add URL to the monitored list.\nReason: ${responseData.error}`;
                    api.sendMessage(errorMessage, event.threadID);
                } else {
                    const baseUrl = "https://botscope.iampat404.repl.co/";
                    const successMessage = `OK: ${responseData.message}\n\nYou can check the details at the following URL:\n${baseUrl}`;
                    api.sendMessage(successMessage, event.threadID);
                }
            });
        })
        .on("error", (error) => {
            const errorMessage = `ERROR: Failed to add URL to the monitored list.\nReason: ${error.message}`;
            api.sendMessage(errorMessage, event.threadID);
        });
}

module.exports = botscope;
