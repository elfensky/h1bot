const { performance } = require('perf_hooks');
const dotenv = require('dotenv');
const chalk = require('chalk');
const pino = require('pino');
//api
const fetchAttackEvents = require('../api/fetchAttackEvents');
const fetchAttackEventById = require('../api/fetchAttackEventById');
//database
const {
    db_getEvent,
    db_getEventById,
    db_getAllActive,
    db_updateEvent,
    db_SaveEvent,
} = require('../prisma/functions/attackOperations');
// components
const { generate_attack_message } = require('../utilities/generateMessage');

//config
dotenv.config();
const log = pino({
    transport: {
        target: 'pino-pretty',
    },
});

async function updateAttack(channel) {
    const start = performance.now();

    const api = await fetchAttackEvents().then((response) => response.data); //api - get most recent data
    const chats = await db_getAllActive();
    let deleted;

    try {
        api.forEach(async (attack) => {
            //find existing chat
            const chat = chats.find(
                (item) => item.event_id === attack.event_id
            );

            //if not in db and active, post and db_save new chat
            if (!chat && attack.status === 'active') {
                const content = generate_defence_message(api); // create message content
                const message = await channel.send(content); // post message to discord (returns message object)
                const event = await db_SaveEvent(api.event_id, message.id); // save event with --linked messageId --- to database
                log.info(
                    chalk.cyan('attack.js') +
                        chalk.white(' updateAttack() created event(') +
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
                const content = generate_defence_message(attack, chat); // create message content
                const update = await message.edit(content); // update the message with new content
                const event = await db_updateEvent(attack); // update the database record
                log.info(
                    chalk.cyan('attack.js') +
                        chalk.white(' updateAttack() updated event(') +
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
                chalk.cyan('attack.js') +
                    chalk.white(`updateAttack() set event(`) +
                    chalk.yellow(exists.event_id) +
                    chalk.white(') to deleted in ') +
                    chalk.blue((performance.now() - start).toFixed(3) + ' ms')
            );
        }
    }
}

module.exports = updateAttack;
