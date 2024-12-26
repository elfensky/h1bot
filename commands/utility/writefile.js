const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
// const getOfficialCampaignStatus = require('../../api/getOfficialCampaignStatus');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('writefile')
        .setDescription('test file write'),
    async execute(interaction) {
        try {
            data = {
                test: true,
            };

            const jsonData = JSON.stringify(data, null, 2);

            // Define the file path
            const now = new Date();
            const timestamp = now
                .toISOString()
                .replace(/T/, '_')
                .replace(/:/g, '-')
                .split('.')[0];
            const fileName = `${timestamp}_test.json`;

            let dirPath;

            if (process.env.NODE_ENV === 'production') {
                dirPath = path.join('/app', 'data');
            } else {
                dirPath = path.join(__dirname, '..', '..', 'data');
            }

            console.log(dirPath);
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
            console.error('Errored writing file', error);
            await interaction.reply('Error writing file.');
        }
    },
};
