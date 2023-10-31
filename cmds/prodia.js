const axios = require('axios');
const { readFileSync, writeFileSync, createReadStream } = require('fs');
const { Prodia } = require('../0x3/prodiaClient.js');
__path = process.cwd();

async function prodia(event, api) {
    const apiKeys = JSON.parse(readFileSync(__path + '/json/api_config.json'));
    const prodiaKey = apiKeys.prodia_key;
    let args = event.body.split(" ");
    args.shift();
    let [p, m] = args.join(" ").split("|").map((item, index) => index === 0 ? item.trim() : parseInt(item));

    if (/-help\b/gi.test(args)) {
        const usage = "Usage:\n" +
            "Prodia <prompt>|[number] (Optional): The prodia command allows users to generate AI images using the Prodia image generation service. Prodia provides access to over 50 different AI models for generating images from text prompts.\n" +
            "Adding a number after the prompt will generate that many images based on the same prompt.\n" +
            "Prodia -l | --list: to see a list of available Prodia models\n\n" +
            "Examples:\n" +
            "Prodia cute cats\n" +
            "Prodia a cute pony flying through the sky | 25\n" +
            "Prodia --list\n\n" +
            "Note: The image generation process may take some time depending on the complexity of the prompt and model used. Let users know the command is processing if it takes more than a few seconds";
        return api.sendMessage(usage, event.threadID);
    }

    let prodia = new Prodia(prodiaKey);
    let models = await prodia.getModelList();
    let ln = models.length;

    if (/(?<!-)(--list|-l)\b/gi.test(args)) {
        let msg = "",
            c = 0;
        for (let model of models) {
            msg += `${c + 1}. ${model}\n`;
            c++;
        }
        return api.sendMessage("List Of Available Models (ALL " + c + "): \n\n" + msg, event.threadID);
    }

    if (!p) {
        return api.sendMessage("Prompt cannot be empty!", event.threadID);
    } else if (m) {
        if (m > ln) {
            return api.sendMessage("Model is not available yet, max number is " + ln + "\n\nType 'prodia --list' to view the lists of available models.", event.threadID);
        }
        m = m - 1;
    }

    let create = await prodia.genImage({
        "model": (typeof m == 'undefined') ? models[12] : models[m],
        "prompt": p,
        "negativePrompt": "BadDream, (UnrealisticDream:1.3), Badly Drawn, Ugly, Blurry",
        "steps": 28,
        "cfgScale": 7,
        "seed": -1,
        "sampler": "DPM++ SDE Karras",
        "upscale": true,
        "aspectRatio": "portrait"
    })

    while (create.status !== "succeeded" && create.status !== "failed") {
        new Promise((resolve) => setTimeout(resolve, 250));

        const job = await prodia.getJob(create.job);

        if (job.status === "succeeded") {
            //console.log(job);
            finish();
            break;
        }
        async function finish() {
            let filePath = `${__path}/temp/prodia${event.senderID}.png`;
            let imgdata = await downloadImage(job.imageUrl);
            await writeFileSync(filePath, imgdata);


            api.sendMessage({
                attachment: createReadStream(filePath)
            }, event.threadID, event.messageID);
        }
    }
}

async function downloadImage(imageUrl) {
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        return response.data;
    } catch (error) {
        throw new Error('Error downloading image');
    }
}


module.exports = prodia;