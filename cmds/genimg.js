const axios = require('axios');
const fs = require('fs');
const path = require('path');
const userAgent = require('fake-useragent');
const ua = new userAgent();

async function genimg(event, api) {
  const input = event.body.toLowerCase().trim();

  if (input.includes('-help')) {
    const usage = "Usage: genimg [prompt]\n\n" +
      "Description: Generates an image based on the provided prompt and sends it to you.\n\n" +
      "Example: genimg A peaceful nature scene";
    api.sendMessage(usage, event.threadID);
    return;
  }

  const prompt = input.slice(7);

  api.sendMessage('🖼️ Generating image...\nPlease wait while I process your request.', event.threadID);

  try {
    const result = await Midjourney(prompt);
    if (result.result) {
      const imageUrl = result.result[0];
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data);
      const imagePath = path.join(__dirname, '../temp/genimg.png');

      fs.writeFileSync(imagePath, imageBuffer);

      const message = {
        body: 'Here is the image you requested:',
        attachment: fs.createReadStream(imagePath)
      };
      api.sendMessage(message, event.threadID, event.messageID);
    } else {
      api.sendMessage('🛠️ An error occurred while generating the image. Please try again later.', event.threadID, event.messageID);
    }
  } catch (error) {
    console.error(error);
    api.sendMessage('🛠️ An error occurred while processing your request. Please try again later.', event.threadID, event.messageID);
  }
}

async function Midjourney(prompt, prompt_navigate = null, model = 'midjourney-diffusion', potrait = false, scheduler = 0, sleep_timer = 2) {
  try {
const shd = ['DDIM', 'K_EULER', 'PNDM', 'KLMS'];

    const height = potrait ? 768 : 512;
    const width = potrait ? 1024 : 512;

    const models = [
      {
        name: 'openjourney',
        version:
          '9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb',
        id: 'prompthero/openjourney',
      },
      {
        name: 'midjourney-diffusion',
        id: 'tstramer/midjourney-diffusion',
        version:
          '436b051ebd8f68d23e83d22de5e198e0995357afef113768c20f0b6fcef23c8b',
      },
      {
        name: 'stable-diffusion',
        id: 'stability-ai/stable-diffusion',
        version:
          'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
      },
    ];

    if (scheduler > shd.length - 1) {
      return {
        error: `Invalid scheduler index. Choose between 0 and ${shd.length - 1}`,
      };
    }

    const modelInfo = models.find((m) => m.name === model);
    if (!modelInfo) {
      return {
        error: `No model found with this name ${model}`,
      };
    }

    const { version, id } = modelInfo;
    const url = `https://replicate.com/api/models/${id}/versions/${version}/predictions`;
    const headers = {
      Origin: 'https://replicate.com',
      Referer: `https://replicate.com/${id}`,
      'User-Agent': ua.random,
    };

    const data = {
      inputs: {
        width: width,
        height: height,
        prompt: prompt,
        scheduler: shd[scheduler],
        num_outputs: 1,
        guidance_scale: 7.5,
        prompt_strength: 0.8,
        num_inference_steps: 50,
        negative_prompt: prompt_navigate || '',
      },
    };

    const r1 = await axios.post(url, data, { headers: headers });
    const uuid = r1.data.uuid;

    if (!uuid) {
      return { error: r1.data };
    }

    while (true) {
      const url2 = `https://replicate.com/api/models/${id}/versions/${version}/predictions/${uuid}`;
      const r2 = await axios.get(url2);

      const _j = r2.data.prediction;
      const status = _j.status;
      
      /*console.log('ID -> ', uuid);
      console.log('Status -> ', status);*/

      if (!status) {
        return { error: r2.data, code: r2.status };
      }

      if (status === 'succeeded') {
        console.log('Generated Successfully!');
        return { result: _j.output };
      }

      if (status === 'canceled' || status === 'failed') {
        return {
          error: `Image generation process: ${status}`,
          code: r2.status,
        };
      }

      await new Promise((resolve) => setTimeout(resolve, sleep_timer * 1000));
    }
  } catch (error) {
    return { error: error.message, code: 400 };
  }
}

module.exports = genimg;
