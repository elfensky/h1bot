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
const { updateDefend, cleanupDefend } = require('./auto/defend');
const updateAttack = require('./auto/attack');

// #region CONFIG
dotenv.config(); // Load environment variables from .env file
const log = pino({
    transport: {
        target: 'pino-pretty',
    },
});
log.info(chalk.cyan('app.js ') + chalk.white('- initializing...'));

const token = process.env.TOKEN; // const { token } = require('./config.json');
const guildId = process.env.GUILD_ID;
const channelId = process.env.CHANNEL_ID;
// #endregion

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// #region COMMANDS
// setup config for commands
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
//add /commands folder to the client
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
// implement command handler
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
// #endregion

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
    const guild = client.guilds.cache.get(guildId);
    const channel = guild.channels.cache.get(channelId);

    log.info(
        chalk.cyan('app.js ') +
            chalk.white('- logged in as ') +
            chalk.yellow(readyClient.user.tag)
    );

    runMigrations().then(() => {
        async () => {
            log.info(chalk.cyan('crons ' + chalk.white('- starting...')));
        };

        const defendUpdateCron = new CronJob(
            '*/15 * * * * *', //every 15 seconds
            async () => {
                log.info(
                    chalk.cyan('crons ') + chalk.white('- ran defendUpdateCron')
                );

                await updateDefend(channel);
            },
            true, // Start the job right now)
            'Europe/Brussels' // Time zone);
        );

        const defendCleanupCron = new CronJob(
            '30 * * * *', //once an hour, at 30 minutes of the hour
            async () => {
                log.info(
                    chalk.cyan('crons ') +
                        chalk.white('- ran defendCleanupCron')
                );

                await cleanupDefend(channel);
            },
            true, // Start the job right now)
            'Europe/Brussels' // Time zone);
        );

        // const attackUpdateCron = new CronJob(
        //     '*/5 * * * * *',
        //     async () => {
        //         log.info(
        //             chalk.cyan('crons ') + chalk.white('- attackUpdateCron')
        //         );

        //         const info = await updateAttack(channel);

        //         log.info(
        //             chalk.cyan(info.action) +
        //                 chalk.white(' - ') +
        //                 chalk.blue(
        //                     (performance.now() - info.start).toFixed(3) + ' ms'
        //                 ) +
        //                 chalk.white(info.message) +
        //                 chalk.yellow(info.variable)
        //         );
        //     },
        //     true, // Start the job right now)
        //     'Europe/Brussels' // Time zone);
        // );
    });
});

// Log in to Discord with your client's token
client.login(token);
