const axios = require('axios');
const https = require('https');
const FormData = require('form-data');

async function fetchAttackEvents() {
    const host =
        process.env.NODE_ENV === 'production'
            ? 'https://api.helldivers.bot'
            : 'http://127.0.0.1:3000';
    const url = `${host}/bot/attack`;

    try {
        // Make the GET request
        const response = await axios.get(url);
        // Access the response data
        const data = response.data;
        return data;
        // console.log('Response:', data);
    } catch (error) {
        console.error('Error pinging API:', error);
        throw error; // Re-throw the error if you want to handle it outside
    }
}

module.exports = fetchAttackEvents;
