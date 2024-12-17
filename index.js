// Require the necessary discord.js classes
const fs = require('node:fs');
const { CronJob } = require('cron');
const path = require('node:path');
const axios = require('axios');
const https = require('https');
const dotenv = require('dotenv');
const FormData = require('form-data');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

const data = require('./db/data.json');

dotenv.config(); // Load environment variables from .env file

const token = process.env.TOKEN; // const { token } = require('./config.json');
const guildId = process.env.GUILD_ID;
const channelId = process.env.CHANNEL_ID;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// add /commands folder to the client
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    }
}

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(
            `No command matching ${interaction.commandName} was found.`
        );
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral,
            });
        } else {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral,
            });
        }
    }
});

// Function to ping the API
async function getCampaignStatus() {
    // The API URL you want to ping
    const url = 'https://api.helldiversgame.com/1.0/';
    const form = new FormData();
    form.append('action', 'get_campaign_status');

    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    try {
        // Make the POST request
        axios
            .post(url, form, {
                httpsAgent: agent,
                headers: {
                    ...form.getHeaders(), // Set the correct headers for form data
                },
            })
            .then((response) => {
                return response.json();
                // console.log('Response:', response.data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    } catch (error) {
        console.error('Error pinging API:', error);
    }
}

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
    // Tags.sync(); // Sync the Tags table

    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    const checkApiEveryMinute = new CronJob(
        '* * * * *',
        () => {
            console.log('Checking API...');
            // getCampaignStatus();,
        },
        null, // No onComplete function
        true, // Start the job right now)
        'Europe/Brussels' // Time zone);
    );

    const postDefenseEvent = new CronJob(
        '* * * * *',
        () => {
            console.log('Posting defense event...');
            const guild = client.guilds.cache.get(guildId);
            const channel = guild.channels.cache.get(channelId);

            const now = new Date();

            channel.send(`posting about defence: ${now}`);
        },
        null, // No onComplete function
        true, // Start the job right now)
        'Europe/Brussels' // Time zone);
    );

    postDefenseEvent.start();
});

// Log in to Discord with your client's token
client.login(token);
