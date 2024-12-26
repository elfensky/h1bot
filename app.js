// logs, monitoring, etc
require('./sentry.js'); //sentry.io
const pino = require('pino'); //low overhead nodejs logger
const chalk = require('chalk'); //colorful terminal output
// dependencies
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const { CronJob } = require('cron');
const runMigrations = require('./utilities/runMigrations');
// discord.js components
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
// CRONS
const updateEvent = require('./updates/event');

dotenv.config(); // Load environment variables from .env file
const log = pino({
    transport: {
        target: 'pino-pretty',
    },
});
log.info(chalk.white('APP - initializing...'));
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

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
    runMigrations();

    const guild = client.guilds.cache.get(guildId);
    const channel = guild.channels.cache.get(channelId);

    log.info(
        chalk.white('APP - logged in as ') + chalk.yellow(readyClient.user.tag)
    );

    const eventUpdate = new CronJob(
        '* * * * *',
        async () => {
            const status = await updateEvent(channel);
        },
        () => {
            log.info(chalk.white('UPDATE - defence event update success.'));
        }, // No onComplete function
        true, // Start the job right now)
        'Europe/Brussels' // Time zone);
    );
});

// Log in to Discord with your client's token
client.login(token);
