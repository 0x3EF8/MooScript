const google = require("googlethis");

async function searchEntity(event, api) {
    const input = event.body.toLowerCase().split(" ");

    if (input.includes("-help")) {
        const usage = "Usage: searchEntity [query]\n\n" + "Description: Retrieves the Knowledge Panel information for the specified entity.\n\n" + "Example: searchEntity Stephen Hawking";
        api.sendMessage(usage, event.threadID);
        return;
    }

    const query = input.slice(1).join(" ");
    const options = {
        additional_params: {
            hl: "en",
        },
    };

    try {
        const response = await google.search(query, options);
        const knowledgePanel = response.knowledge_panel;

        if (knowledgePanel) {
            let message = "";

            message += `Type: ${knowledgePanel.type}\n`;
            message += `Title: ${knowledgePanel.title}\n`;
            message += `Description: ${knowledgePanel.description}\n`;
            message += `URL: ${knowledgePanel.url}\n\n`;

            if (knowledgePanel.metadata && knowledgePanel.metadata.length > 0) {
                message += "Metadata:\n";
                knowledgePanel.metadata.forEach((metadata) => {
                    message += `${metadata.title}: ${metadata.value}\n`;
                });
                message += "\n";
            }

            if (knowledgePanel.books && knowledgePanel.books.length > 0) {
                message += "Books:\n";
                knowledgePanel.books.forEach((book) => {
                    message += `${book.title} (${book.year})\n`;
                });
                message += "\n";
            }

            if (knowledgePanel.tv_shows_and_movies && knowledgePanel.tv_shows_and_movies.length > 0) {
                message += "TV Shows and Movies:\n";
                knowledgePanel.tv_shows_and_movies.forEach((show) => {
                    message += `${show.title} (${show.year})\n`;
                });
                message += "\n";
            }

            if (knowledgePanel.images && knowledgePanel.images.length > 0) {
                message += "Images:\n";
                knowledgePanel.images.forEach((image) => {
                    message += `URL: ${image.url}\n`;
                    message += `Source: ${image.source}\n\n`;
                });
            }

            api.sendMessage(message, event.threadID).catch((err) => {
                console.error(`Error sending message: ${err}`);
            });
        } else {
            api.sendMessage("No Knowledge Panel information found for the specified entity.", event.threadID).catch((err) => {
                console.error(`Error sending message: ${err}`);
            });
        }
    } catch (err) {
        console.error(`Error searching on Google: ${err}`);
        api.sendMessage("Failed to search. Please try again later.", event.threadID).catch((err) => {
            console.error(`Error sending message: ${err}`);
        });
    }
}

module.exports = searchEntity;
