const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const victoryList = [0, 0, 0, 0];
const factionNameList = ['Bugs', 'Cyborgs', 'Illuminates', 'Super Earth'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('season')
        .setDescription('Show historical data for the specified season')
        .addStringOption((option) =>
            option
                .setName('season')
                .setDescription('the # season you want to know more about')
                .setRequired(true)
        ),
    async execute(interaction) {
        const userInput = interaction.options.getString('season');

        try {
            const seasonId = parseInt(userInput, 10); // Set the specific season ID you want to fetch

            const response = await axios.post(
                'https://api.helldiversgame.com/1.0/',
                'action=get_campaign_status',
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    httpsAgent: new (require('https').Agent)({
                        rejectUnauthorized: false,
                    }),
                }
            );

            const retrievedData = response.data;
            const currentWarId = parseInt(
                retrievedData.campaign_status[0].season,
                10
            );

            if (seasonId >= currentWarId) {
                console.log(
                    `Season ID ${seasonId} is not valid. The current war ID is ${
                        currentWarId - 1
                    }.`
                );
                return;
            }

            console.log('UTC HD1 campaign end date for season ID:', seasonId);

            const seasonResponse = await axios.post(
                'https://api.helldiversgame.com/1.0/',
                `action=get_snapshots&season=${seasonId}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    httpsAgent: new (require('https').Agent)({
                        rejectUnauthorized: false,
                    }),
                }
            );

            const seasonData = seasonResponse.data;

            let defendTime = 0;
            if (seasonData.defend_events.length !== 0) {
                defendTime = parseInt(
                    seasonData.defend_events[
                        seasonData.defend_events.length - 1
                    ].end_time,
                    10
                );
            }

            let attackTime = 0;
            if (seasonData.attack_events.length !== 0) {
                attackTime = parseInt(
                    seasonData.attack_events[
                        seasonData.attack_events.length - 1
                    ].end_time,
                    10
                );
            }

            let maxDate;
            let factionIndex;
            if (attackTime > defendTime) {
                maxDate = attackTime;
                factionIndex = 3;
            } else {
                factionIndex = parseInt(
                    seasonData.defend_events[
                        seasonData.defend_events.length - 1
                    ].enemy,
                    10
                );
                maxDate = defendTime;
            }

            victoryList[factionIndex] += 1;
            const message = `War ${seasonId}: ${new Date(maxDate * 1000)
                .toISOString()
                .replace('T', ' ')
                .substring(0, 19)} ${factionNameList[factionIndex]} victory`;

            await interaction.reply(message);

            console.log(`\nFinished HD1 campaign count: ${currentWarId - 1}`);

            for (let factionIndex = 0; factionIndex < 4; factionIndex++) {
                const victoryCount = victoryList[factionIndex];
                const percentage = (
                    (victoryCount * 100) /
                    (currentWarId - 1)
                ).toFixed(1);
                console.log(
                    `${factionNameList[factionIndex]} victory count: ${victoryCount} (${percentage}%)`
                );
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    },
};
