const google = require("googlethis");

async function googleSearch(event, api) {
    const input = event.body.toLowerCase().split(" ");

    if (input.includes("-help")) {
        const usage = "Usage: googlethis [query]\n\n" + "Description: Searches for the specified query using Google and returns the results.\n\n" + "Example: googlethis TWDG";
        api.sendMessage(usage, event.threadID);
        return;
    }

    const query = input.slice(1).join(" ");
    const options = {
        page: 0,
        safe: false,
        parse_ads: false,
        additional_params: {
            hl: "en",
        },
    };

    try {
        const response = await google.search(query, options);
        const results = response.results;

        if (results.length > 0) {
            let message = "";

            results.forEach((result) => {
                message += `Title: ${result.title}\n`;
                message += `Description: ${result.description}\n`;
                message += `URL: ${result.url}\n\n`;
            });

            api.sendMessage(message, event.threadID);
        } else {
            api.sendMessage("No results found.", event.threadID);
        }
    } catch (err) {
        console.error(`Error searching on Google: ${err}`);
        api.sendMessage("Failed to search. Please try again later.", event.threadID);
    }
}

module.exports = googleSearch;
