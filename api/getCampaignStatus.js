const axios = require('axios');
const https = require('https');
const FormData = require('form-data');

async function getCampaignStatus() {
    // The API URL you want to ping
    const host =
        process.env.NODE_ENV === 'production'
            ? 'https://api.helldivers.bot'
            : 'http://127.0.0.1:3000';

    const url = `${host}/rebroadcast`;
    //formdata
    const form = new FormData();
    form.append('action', 'get_campaign_status');

    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    try {
        // Make the POST request
        const response = await axios.post(url, form, {
            httpsAgent: agent,
            headers: {
                ...form.getHeaders(), // Set the correct headers for form data
            },
        });

        // Access the response data
        const data = response.data;
        return data;
        // console.log('Response:', data);
    } catch (error) {
        console.error('Error pinging API:', error);
        throw error; // Re-throw the error if you want to handle it outside
    }
}

module.exports = getCampaignStatus;
