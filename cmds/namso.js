const namso = require("namso-cc-gen");

async function genBin(event, api) {
    const args = event.body.split(" ");

    if (args.length > 1 && args[1] === "-help") {
        const usage =
            "Usage: Namso [quantity] [bin]\n\n" +
            "Description: Generates credit card numbers based on the provided BIN (Bank Identification Number).\n\n" +
            "Example: Namso 5 123456\n\n" +
            "Note: The command generates the specified quantity of credit card numbers with random CVV, expiration date, and in PIPE format.";
        api.sendMessage(usage, event.threadID);
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

    api.sendMessage(result, event.threadID);
}

module.exports = genBin;
