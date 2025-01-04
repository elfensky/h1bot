const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const getCampaignStatus = require('../../api/getCampaignStatus');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const victoryList = [0, 0, 0, 0];
const factionNameList = ['Bugs', 'Cyborgs', 'Illuminates', 'Super Earth'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('history')
        .setDescription('Shows the bloody history of the Galatic Campaign'),
    async execute(interaction) {
        try {
            await interaction.deferReply();

            let msg_processing = 'processing campaign history... \n';
            await interaction.editReply(msg_processing);

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
            // const currentWarId = 10;

            for (let seasonId = 1; seasonId < currentWarId; seasonId++) {
                const response = await axios.post(
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

                const retrievedData = response.data;

                let defendTime = 0;
                if (retrievedData.defend_events.length !== 0) {
                    defendTime = parseInt(
                        retrievedData.defend_events[
                            retrievedData.defend_events.length - 1
                        ].end_time,
                        10
                    );
                }

                let attackTime = 0;
                if (retrievedData.attack_events.length !== 0) {
                    attackTime = parseInt(
                        retrievedData.attack_events[
                            retrievedData.attack_events.length - 1
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
                        retrievedData.defend_events[
                            retrievedData.defend_events.length - 1
                        ].enemy,
                        10
                    );
                    maxDate = defendTime;
                }

                victoryList[factionIndex] += 1;

                const message = `War ${seasonId}: ${new Date(maxDate * 1000)
                    .toISOString()
                    .replace('T', ' ')
                    .substring(0, 19)} ${
                    factionNameList[factionIndex]
                } victory\n`;
                msg_processing = msg_processing + message;
                await interaction.editReply(msg_processing);
            }

            // const msg_data1 = `**Helldivers 1 Galatic Campaign History**\n`;
            const msg_campaign = `Finished HD1 campaign count: ${
                currentWarId - 1
            }\n`;

            msg_processing = msg_processing + msg_campaign;
            await interaction.editReply(msg_processing);

            let msg_faction = '';
            for (let factionIndex = 0; factionIndex < 4; factionIndex++) {
                const victoryCount = victoryList[factionIndex];
                const percentage = (
                    (victoryCount * 100) /
                    (currentWarId - 1)
                ).toFixed(1);

                const message = `${factionNameList[factionIndex]} victory count: ${victoryCount} (${percentage}%)\n`;
                msg_processing = msg_processing + message;
                msg_faction = msg_faction + message;
                await interaction.editReply(msg_processing);
            }

            // const complete = `
            // **Helldivers 1 Galatic Campaign History**
            // ${msg_campaign}
            // ${msg_faction}
            // `;

            await interaction.followUp('processing campaign history complete.');
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    },
};
