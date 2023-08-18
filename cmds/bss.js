const axios = require("axios");

async function bss(event, api) {
    const input = event.body.trim().split(" ");

    if (input.includes("-help")) {
        const usage = "Usage: bss\n\n" + "Description: Retrieves the status of the Botscope API services.\n\n" + "Note: This command provides information about the status, uptime, downtime, and last ping of each service.";
        api.sendMessage(usage, event.threadID);
        return;
    }

    try {
        const response = await axios.get("http://botscope.iampat404.repl.co/api/ping/status");
        const apiData = response.data;

        let output = "BOTSCOPE: BOT PERFORMANCE MONITORING STATUS\n\n";
        for (const serviceName in apiData) {
            const service = apiData[serviceName];
            output += `Service: ${serviceName}\n`;
            //output += `URL: ${service.url}\n`;
            output += `Status: ${service.status}\n`;
            output += `Uptime: ${service.upTime}\n`;
            output += `Downtime: ${service.downTime}\n`;
            output += `Added Date: ${service.addedDate}\n`;
            output += `Last Ping: ${service.lastPing}\n`;
            output += `Ping: ${service.ping} ms\n`;
            output += `Warning: ${service.warningMessage}\n\n`;
        }

        await api.sendMessage(output, event.threadID);
    } catch (error) {
        if (error.response && error.response.data) {
            const htmlRegex = /<[^>]+>/g;
            const errorMessage = error.response.data.__html.replace(htmlRegex, "");
            console.error("Error fetching API status:", errorMessage);
            await api.sendMessage("Failed to fetch API status. Reason: " + errorMessage, event.threadID);
        } else {
            console.error("Error fetching API status:", error.message);
            await api.sendMessage("Failed to fetch API status.", event.threadID);
        }
    }
}

module.exports = bss;
