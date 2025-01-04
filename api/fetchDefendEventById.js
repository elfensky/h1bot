const axios = require('axios');
const https = require('https');
const FormData = require('form-data');

async function fetchDefendEventById(id) {
    const host =
        process.env.NODE_ENV === 'production'
            ? 'https://api.helldivers.bot'
            : 'http://127.0.0.1:3000';

    // const url = 'http://127.0.0.1:3000/v1/event';
    // const url = 'https://api.helldivers.bot/v1/event'; // The API URL you want to ping
    const url = `${host}/bot/defend/${id}`;

    try {
        // Make the GET request
        const response = await axios.get(url);
        // Access the response data
        const data = response.data;
        return data;
    } catch (error) {
        console.error('Error pinging API:', error);
        throw error; // Re-throw the error if you want to handle it outside
    }
}

module.exports = fetchDefendEventById;
