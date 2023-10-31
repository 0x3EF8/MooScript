const axios = require('axios');

class Prodia {
    constructor(apikey) {
        this.apikey = apikey;
        this.baseUrl = 'https://api.prodia.com';
        this.headers = {
            'X-Prodia-Key': this.apikey,
            'accept': 'application/json',
            'content-type': 'application/json',
        }
    }

    async getModelList() {

        let endpoint = `/v1/sd/models`;
        let response = await axios.request(this.baseUrl + endpoint, {
            method: "GET",
            headers: this.headers
        });
        let list_models = response.data;

        return list_models;
    }

    async genImage(params) {
        const endpoint = '/v1/sd/generate';

        const data = {
            model: params.model,
            prompt: params.prompt,
            negative_prompt: params.negativePrompt,
            steps: params.steps,
            cfg_scale: params.cfgScale,
            seed: params.seed,
            upscale: params.upscale,
            sampler: params.sampler,
            aspect_ratio: params.aspectRatio,
        };
        console.log(data);
        let result = await axios(this.baseUrl + endpoint, {
            method: 'POST',
            headers: this.headers,
            data
        });

        return result.data;
    }

    async getJob(jobId) {
        let url = this.baseUrl + "/v1/job/";
        const options = {
            "method": 'GET',
            "headers": this.headers
        }
        try {
            let job = (await axios(`${url}${jobId}`, options)).data;
            return job;
        } catch (error) {
            return error;
        }
    }
}

module.exports = {Prodia};