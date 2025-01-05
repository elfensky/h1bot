const { performance } = require('perf_hooks');
const dotenv = require('dotenv');
const chalk = require('chalk');
const pino = require('pino');
//api
const fetchDefendEvents = require('../api/fetchDefendEvents');
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

    const api = await fetchDefendEvents().then((response) => response.data); //api - get most recent data
    const chats = await db_getAllActive();
    let deleted;

    try {
        api.forEach(async (defend) => {
            //find existing chat
            const chat = chats.find(
                (item) => item.event_id === defend.event_id
            );

            //if not in db and active, post and db_save new chat
            if (!chat && defend.status === 'active') {
                const content = generate_defence_message(api); // create message content
                const message = await channel.send(content); // post message to discord (returns message object)
                const event = await db_SaveEvent(api.event_id, message.id); // save event with --linked messageId --- to database
                log.info(
                    chalk.cyan('defend.js') +
                        chalk.white(' updateDefend() created event(') +
                        chalk.yellow(event.event_id) +
                        ') in ' +
                        chalk.blue(
                            (performance.now() - start).toFixed(3) + ' ms'
                        )
                );
                return;
            }

            //update existing chat
            if (chat && chat.active) {
                deleted = chat.event_id; //precaution if the message has been deleted, variable will be used in the catch block below
                const message = await channel.messages.fetch(chat.message_id); // fetch message from discord by id -> this will error if the message is deleted
                const content = generate_defence_message(defend, chat); // create message content
                const update = await message.edit(content); // update the message with new content
                const event = await db_updateEvent(defend); // update the database record
                log.info(
                    chalk.cyan('defend.js') +
                        chalk.white(' updateDefend() updated event(') +
                        chalk.yellow(event.event_id) +
                        ') in ' +
                        chalk.blue(
                            (performance.now() - start).toFixed(3) + ' ms'
                        )
                );
                return;
            }
        });
    } catch (error) {
        if (error.constructor.name === 'DiscordAPIError') {
            if (error.message === 'Unknown Message') {
                await db_setInactive(deleted); // set deleted message to inactive
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
