const { performance } = require('perf_hooks');
const dotenv = require('dotenv');
const chalk = require('chalk');
const pino = require('pino');
//api
const fetchDefendEvent = require('../api/fetchDefendEvent');
const fetchDefendEventById = require('../api/fetchDefendEventById');
//database
const {
    db_getEvent,
    db_getEventById,
    db_getAllActive,
    db_updateEvent,
    db_SaveEvent,
    db_setInactive,
} = require('../prisma/functions/defendOperations');
// components
const { generate_defence_message } = require('../utilities/generateMessage');

//config
dotenv.config();
const log = pino({
    transport: {
        target: 'pino-pretty',
    },
});

async function updateDefend(channel) {
    const start = performance.now();

    const api = await fetchDefendEvent().then((response) => response.data); //api - get most recent data
    const exists = await db_getEventById(api.event_id);

    // #region ALWAYS CREATE A NEW POST OR UPDATE THE LATEST EVENT
    try {
        if (!exists) {
            //if no event in database this is a completely new event.
            // It's always new, and should always be posted, because it's the LATEST event, no matter its status.

            //start discord.js
            const content = generate_defence_message(api); // create message content
            const message = await channel.send(content); // post message to discord (returns message object)
            //start prisma
            const event = await db_SaveEvent(api.event_id, message.id); // save event with --linked messageId --- to database

            log.info(
                chalk.cyan('defend.js') +
                    chalk.white(' updateDefend() created new message ') +
                    chalk.blue((performance.now() - start).toFixed(3) + ' ms')
            );
        } else {
            // this event was already posted.
            // if it's active, update the discord message and database record.
            if (exists.active) {
                //start prisma
                const event = await db_updateEvent(api); // update the database record
                //start discord.js
                const content = generate_defence_message(api, event); // create message content
                const message = await channel.messages.fetch(event.message_id); // fetch message from discord by id
                const update = await message.edit(content); // update the message with new content

                log.info(
                    chalk.cyan('defend.js') +
                        chalk.white(
                            ' updateDefend() updated existing message '
                        ) +
                        chalk.blue(
                            (performance.now() - start).toFixed(3) + ' ms'
                        )
                );
            } else {
                log.info(
                    chalk.cyan('defend.js') +
                        chalk.white(' updateDefend() current event is over ') +
                        chalk.blue(
                            (performance.now() - start).toFixed(3) + ' ms'
                        )
                );
            }
        }
    } catch (error) {
        if (error.constructor.name === 'DiscordAPIError') {
            if (error.message === 'Unknown Message') {
                const event = await db_setInactive(exists.event_id); // update the database record
            }
            log.info(
                chalk.cyan('defend.js') +
                    chalk.white(`updateDefend() set event(`) +
                    chalk.yellow(exists.event_id) +
                    chalk.white(') to deleted in ') +
                    chalk.blue((performance.now() - start).toFixed(3) + ' ms')
            );
        }
    }
    // #endregion

    // const is_active = api.status === 'active' ? true : false; //status
    //database - get the most recent event
    // const list = await db_getAllActive().then((response) => response.data); //api - get most recent data
}

async function cleanupDefend(channel) {
    //update all past still-active defend events
    const start = performance.now();

    const list = await db_getAllActive();

    if (!list || list.length === 0) {
        log.info(
            chalk.cyan('defend.js') +
                chalk.white(' cleanupDefend() no active events found ') +
                chalk.blue((performance.now() - start).toFixed(3) + ' ms')
        );
        return;
    }

    list.forEach(async (item) => {
        try {
            //this will fail if the message is deleted and go to the catch path, so this is first
            const message = await channel.messages.fetch(item.message_id); // fetch message from discord by id
            //if a message has been found, continue and get the api data
            const api = await fetchDefendEventById(item.event_id).then(
                (response) => response.data
            ); //api - get most recent data
            const content = generate_defence_message(api, item);
            const update = await message.edit(content);
            const event = await db_updateEvent(api);

            log.info(
                chalk.cyan('defend.js') +
                    chalk.white(' cleanupDefend() updated event_id(') +
                    chalk.yellow(event.event_id) +
                    chalk.white(') with message_id(') +
                    chalk.yellow(event.message_id) +
                    chalk.white(') in ') +
                    chalk.blue((performance.now() - start).toFixed(3) + ' ms')
            );
        } catch (error) {
            if (error.constructor.name === 'DiscordAPIError') {
                if (error.message === 'Unknown Message') {
                    const event = await db_setInactive(item.event_id); // update the database record
                }
                log.info(
                    chalk.cyan('defend.js') +
                        chalk.white(` cleanupDefend() set event(`) +
                        chalk.yellow(item.event_id) +
                        chalk.white(') to deleted in ') +
                        chalk.blue(
                            (performance.now() - start).toFixed(3) + ' ms'
                        )
                );
            }
        }
    });
}

module.exports = {
    updateDefend,
    cleanupDefend,
};
