// logs, monitoring, etc
require('./instrument.js'); //sentry.io
const pino = require('pino'); //low overhead nodejs logger
const chalk = require('chalk'); //colorful terminal output
// dependencies
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const { CronJob } = require('cron');
// discord.js components
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
// api data
const getCampaignStatus = require('./api/getCampaignStatus');

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

const enemies = {
    0: 'Bugs',
    1: 'Cyborgs',
    2: 'The Illuminate',
};

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
    // Tags.sync(); // Sync the Tags table

    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    const postDefenseEvent = new CronJob(
        '* * * * *',
        () => {
            // console.log('Posting defense event...');
            const guild = client.guilds.cache.get(guildId);
            const channel = guild.channels.cache.get(channelId);

            const now = new Date();

            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');

            const time = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

            getCampaignStatus()
                .then((data) => {
                    const json = JSON.stringify(data.defend_event);

                    if (data.defend_event.status === 'active') {
                        console.log(
                            `${time} | **${
                                enemies[data.defend_event.enemy]
                            }** are attacking **sector ${
                                data.defend_event.region
                            }**`
                        );
                        channel.send(
                            `**${
                                enemies[data.defend_event.enemy]
                            }** are attacking **sector ${
                                data.defend_event.region
                            }**`
                        );
                    }
                    if (data.defend_event.status === 'success') {
                        console.log(
                            `${time} | we have successfully defended sector ${
                                data.defend_event.region
                            } from ${enemies[data.defend_event.enemy]}`
                        );
                        // channel.send(
                        //     `we have successfully defended **sector ${
                        //         data.defend_event.region
                        //     }** from **${enemies[data.defend_event.enemy]}**`
                        // );
                    }
                    if (data.defend_event.status === 'fail') {
                        console.log(
                            `${time} | we have lost sector ${
                                data.defend_event.region
                            } to ${enemies[data.defend_event.enemy]}`
                        );
                        // channel.send(
                        //     `we have lost sector **${
                        //         data.defend_event.region
                        //     }** to **${enemies[data.defend_event.enemy]}**`
                        // );
                    }
                })
                .catch((error) =>
                    console.error('Failed to get campaign status:', error)
                );
        },
        null, // No onComplete function
        true, // Start the job right now)
        'Europe/Brussels' // Time zone);
    );
});

// Log in to Discord with your client's token
client.login(token);
