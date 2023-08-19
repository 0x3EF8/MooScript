const google = require("googlethis");
const axios = require("axios");
const cheerio = require("cheerio");

async function brainlySearch(event, api) {
    const input = event.body.toLowerCase();

    if (input.includes("-help")) {
        const usage =
            "Usage: brainly [search term]\n\n" +
            "Description: Search Brainly for the provided query and fetch the first question and answer.\n\n" +
            "Example: brainly How does photosynthesis work?\n\n" +
            "Note: The command searches Brainly using Google, so the quality and availability of answers may vary.";
        api.sendMessage(usage, event.threadID, event.messageID);
        return;
    }

    const text = input.split(" ");
    text.shift();

    try {
        const searchQuery = "Brainly " + text.join(" ");
        const searchResult = await google.search(searchQuery);
        const url = searchResult.results[0].url;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const mainClass = $("h1[data-testid='question_box_text']");
        const res = [];
        mainClass.each((idx, el) => {
            const total = {};
            total.question = $(el).children("span[class='sg-text sg-text--large sg-text--bold sg-text--break-words brn-qpage-next-question-box-content__primary']").text();
            res.push(total);
        });
        const mainClass2 = $("div[class='brn-qpage-next-answer-box__content js-answer-content-section'] div div div");
        const res2 = [];
        mainClass2.each((idx, el) => {
            const total2 = {};
            total2.answer = $(el).children("p").text();
            res2.push(total2);
        });
        if (res.length < 1 && res2.length < 1) {
            api.sendMessage("❌ Sorry, I couldn't find any available answers for your question on Brainly. Please try a different query.", event.threadID, event.messageID);
        } else {
            const q = res[0].question;
            const a = res2[0].answer;
            api.sendMessage(`🔍 Brainly Search Result\n\nQuestion: ${q}\nAnswer: ${a}`, event.threadID, event.messageID);
        }
    } catch (err) {
        console.error(err);
        api.sendMessage("❌ An error occurred while searching Brainly. Please try again later.", event.threadID, event.messageID);
    }
}

module.exports = brainlySearch;
