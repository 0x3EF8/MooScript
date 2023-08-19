const namso = require("namso-cc-gen");
const lookup = require("binlookup")();

async function genbin2(event, api) {
    const args = event.body.split(" ");

    if (args.length > 1 && args[1] === "-help") {
        const usage =
            "Usage: gencc [quantity] [bin]\n\n" +
            "Description: Generates credit card numbers based on the provided BIN (Bank Identification Number) and provides BIN information.\n\n" +
            "Example: gencc 5 123456\n\n" +
            "Note: The command generates the specified quantity of credit card numbers with random CVV, expiration date, and in PIPE format. It also fetches and displays information about the provided BIN.";
        api.sendMessage(usage, event.threadID);
        return;
    }

    if (args.length < 3) {
        api.sendMessage("Usage: genbin2 [quantity] [bin]", event.threadID);
        return;
    }

    const quantity = parseInt(args[1]);
    let bin = args[2];

    const binLength = 16;
    while (bin.length < binLength) {
        bin += "x";
    }

    let result = "";
    for (let i = 0; i < quantity; i++) {
        let res = namso.gen({
            ShowCCV: true,
            CCV: "rnd",
            ShowExpDate: true,
            ShowBank: false,
            Month: "rnd",
            Year: "rnd",
            Quantity: 1,
            Bin: bin,
            Format: "PIPE",
        });

        result += res.trim() + "\n";
    }

    result = result.trim();

    await api.sendMessage(result, event.threadID);

    setTimeout(() => {
        lookup(args[2])
            .then((data) => {
                let response = "Here's the BIN Info\n\n";

                response += `Bin: ${bin}\n`;
                response += `Number Length: ${data.number.length}\n`;
                response += `Luhn: ${data.number.luhn}\n`;
                response += `Scheme: ${data.scheme}\n`;
                response += `Type: ${data.type}\n`;
                response += `Brand: ${data.brand}\n`;
                response += `Prepaid: ${data.prepaid}\n`;
                response += `Country Numeric: ${data.country.numeric}\n`;
                response += `Country Alpha2: ${data.country.alpha2}\n`;
                response += `Country Name: ${data.country.name}\n`;
                response += `Country Emoji: ${data.country.emoji}\n`;
                response += `Country Currency: ${data.country.currency}\n`;
                response += `Country Latitude: ${data.country.latitude}\n`;
                response += `Country Longitude: ${data.country.longitude}\n`;

                if (data.bank) {
                    response += `Bank Name: ${data.bank.name}\n`;
                    response += `Bank URL: ${data.bank.url}\n`;
                    response += `Bank Phone: ${data.bank.phone}\n`;
                    response += `Bank City: ${data.bank.city}\n`;
                }

                api.sendMessage(response, event.threadID);
            })
            .catch((err) => {
                api.sendMessage(`Failed to fetch BIN data. Error: ${err.message}`, event.threadID);
            });
    }, 1000);
}

module.exports = genbin2;
