const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");

async function cmd(event, api) {
    const cmdFolderPath = path.join(__dirname, ".");

    fs.readdir(cmdFolderPath, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return;
        }

        const commandFiles = files.filter((file) => path.extname(file).toLowerCase() === ".js");
        const commandList = commandFiles.map((file) => path.parse(file).name);

        const perPage = 10;
        const totalPages = Math.ceil(commandList.length / perPage);

        let page = parseInt(event.body.toLowerCase().trim().split(" ")[1]) || 1;
        page = Math.max(1, Math.min(page, totalPages));

        const startIndex = (page - 1) * perPage;
        const endIndex = Math.min(startIndex + perPage, commandList.length);

        const commandsToShow = commandList.slice(startIndex, endIndex);

        const formattedDate = moment().tz("Asia/Manila").format("DD/MM/YY, hh:mm:ss A");

        const output = [
            `┌─[ 卄乇乂匚ㄥ卂几 @ ${formattedDate} ]`,
            "├───────────────────",
            "│ ┌─[ Public Commands ]",
            "│ │",
            ...commandsToShow.map((cmd) => `│ ├─[ ${cmd.charAt(0).toUpperCase() + cmd.slice(1)} ]`),
            "│ │",
            `│ └─[ Page ${page} ]`,
            "└───────────────────",
            "",
            `Total Commands: ${commandList.length}`,
            `Page ${page}/${totalPages}`,
            "",
            "Type '-help' followed by a command to get usage and command description. For example, 'Getfile -help'.",
        ];

        api.sendMessage(output.join("\n"), event.threadID);
    });
}

module.exports = cmd;
