const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const getCampaignStatus = require('../../api/getCampaignStatus');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('api')
        .setDescription('Returns JSON-formatted data from the API as a file.'),
    async execute(interaction) {
        try {
            // Fetch the campaign status
            const data = await getCampaignStatus();
            // console.log(data);

            // Convert the data to a JSON string
            const jsonData = JSON.stringify(data, null, 2);

            // Define the file path
            const now = new Date();
            const timestamp = now
                .toISOString()
                .replace(/T/, '_')
                .replace(/:/g, '-')
                .split('.')[0];
            const fileName = `${timestamp}_campaign-status.json`;

            let dirPath;

            if (process.env.NODE_ENV === 'production') {
                dirPath = path.join('/app', 'data');
            } else {
                dirPath = path.join(__dirname, '..', '..', 'data');
            }

            const filePath = path.join(dirPath, fileName);
            console.log(filePath);

            // Write the JSON data to a file
            fs.writeFileSync(filePath, jsonData);

            // Create an attachment from the file
            const attachment = new AttachmentBuilder(filePath);

            // Reply with the attachment
            await interaction.reply({ files: [attachment] });

            // Optionally, delete the file after sending
            fs.unlinkSync(filePath);
        } catch (error) {
            console.error('Error fetching campaign status:', error);
            await interaction.reply(
                'Failed to fetch campaign status. Please try again later.'
            );
        }
    },
};
