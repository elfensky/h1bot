const { performance } = require('perf_hooks');
const dotenv = require('dotenv');
const chalk = require('chalk');
const pino = require('pino');
//api
const getEvent = require('../api/getEvent');
//database
const {
    db_getEventById,
    db_updateEvent,
    db_SaveEvent,
} = require('../prisma/functions/eventOperations');
// enums
const enemies = require('../enums/enemies');
const map = require('../enums/map');

//config
dotenv.config();
const log = pino({
    transport: {
        target: 'pino-pretty',
    },
});

async function updateEvent(channel) {
    const start = performance.now();

    const data = await getEvent().then((data) => data.data);

    const content = formatMessage(data); // create message content

    log.info(
        'event.js - fetched new event data ' + chalk.yellow(data.event_id)
    );

    let event = await db_getEventById(data.event_id); // has event been posted already?

    if (!event) {
        //if event not found, post new event
        const message = await channel.send(content); // post message to discord
        event = await db_SaveEvent(data.event_id, message.id); // save event with linked messageId to database
        log.info(
            'event.js - created event with with message_id ' +
                chalk.yellow(event.message_id)
        );
    } else {
        // update existing event
        if (event.active === false) {
            log.info('event.js - event already posted, not updating');
        } else {
            const message = await channel.messages.fetch(event.message_id); // fetch message from discord
            const update = await message.edit(content);

            if (data.status === 'active') {
                event = await db_updateEvent(data.event_id, true);
            } else {
                event = await db_updateEvent(data.event_id, false);
            }

            log.info(
                'event.js - updated message with message_id ' +
                    chalk.yellow(event.message_id)
            );
        }
    }

    log.info(
        chalk.cyan('event.js - completed in ') +
            chalk.blue((performance.now() - start).toFixed(3) + ' ms')
    );
}

function formatMessage(data) {
    //setup time
    const now = new Date();
    const end = new Date(data.end_time * 1000).getTime();
    const timestamp = now.getTime();
    const humanTime = now.toLocaleTimeString('en-US', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    //calculate time remaining
    const remaining = end - timestamp;
    const humanRemaining = millisecondsToTime(remaining);
    const progress = Math.floor((data.points / data.points_max) * 100);
    const bar = generateProgressBar(progress);

    if (data.status === 'active') {
        const message = `
**🚨 A CAPITAL CITY IS UNDER ATTACK**
**${enemies[data.enemy]}** are attacking **${map[data.enemy][data.region]}** 
Progress: \`${bar}\`
Points: \`${data.points}/${data.points_max}\`
Time: \`${humanRemaining}\` remaining

Last updated at \`${humanTime} UTC+0\` \n
`;
        return message;
    }

    if (data.status === 'failure') {
        const message = `
**${enemies[data.enemy]}** have defeated **${map[data.enemy][data.region]}** 
**💀 SHAMEFUL DEFEAT**
**Our glorious democracy** has been defeated in the **${
            map[data.enemy][data.region]
        }** by **${enemies[data.enemy]}**
Progress: ${bar}
Points: \`${data.points}/${data.points_max}\`

Last updated at \`${humanTime} UTC+0\` \n
`;
        return message;
    }

    if (data.status === 'success') {
        const message = `
**✅ GLORIOUS VICTORY**
**Helldivers** have successfully defended the **${
            map[data.enemy][data.region]
        }** against **${enemies[data.enemy]}**
Progress: \`${bar}\`
Points: \`${data.points}/${data.points_max}\`

Last updated at \`${humanTime} UTC+0\` \n
`;
        return message;
    }
}

function millisecondsToTime(ms) {
    // Calculate total seconds
    const totalSeconds = Math.floor(ms / 1000);

    // Calculate hours, minutes, and seconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Format the time as HH:MM:SS
    const formattedTime = `${hours.toString().padStart(2, '0')} Hours ${minutes
        .toString()
        .padStart(2, '0')} Minutes ${seconds
        .toString()
        .padStart(2, '0')} Seconds`;

    return formattedTime;
}

function generateProgressBar(percentage) {
    const totalBlocks = 12; // Total number of blocks in the progress bar
    const filledBlocks = Math.round((percentage / 100) * totalBlocks); // Calculate the number of filled blocks

    // Create the progress bar string
    // ▰▰▰▱▱▱
    // ✅☑️
    const progressBar =
        '▰'.repeat(filledBlocks) + '▱'.repeat(totalBlocks - filledBlocks);

    // Return the progress bar with the percentage
    return `${progressBar} ${percentage}%`;
}

module.exports = updateEvent;