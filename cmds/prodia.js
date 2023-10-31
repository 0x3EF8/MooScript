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

    let prodia = new Prodia(prodiaKey);
    let models = await prodia.getModelList();
    let ln = models.length;

    if (args[0] == "--list" || args[0] == "-l") {
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