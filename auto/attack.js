const { performance } = require('perf_hooks');
const dotenv = require('dotenv');
const chalk = require('chalk');
const pino = require('pino');
//api
const fetchActiveAttackEvents = require('../api/fetchActiveAttackEvents');
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

    try {
        const api = await fetchActiveAttackEvents().then(
            (response) => response.data
        );
        const chats = await db_getAllActive();
        console.log('api', api.length);
        console.log('chats', chats.length);
        if (api && api.length > 0) {
            //there are active events in the api, update them all.
            api.forEach(async (attack) => {
                const chat = chats.find(
                    (item) => item.event_id === attack.event_id
                );

                if (!chat) {
                    //if no matching event from database, post a new message
                    const content = generate_attack_message(attack); // create message content
                    const message = await channel.send(content); // post message to discord (returns message object)
                    const event = await db_SaveEvent(
                        attack.event_id,
                        message.id
                    ); // save event with --linked messageId --- to database
                    log.info(
                        chalk.cyan('attack.js') +
                            chalk.white(
                                ' updateAttack() created new message '
                            ) +
                            chalk.yellow(event.event_id) +
                            ' ' +
                            chalk.blue(
                                (performance.now() - start).toFixed(3) + ' ms'
                            )
                    );
                    return;
                } else {
                    //update existing message if there is a matching event in the database
                    const discord = await channel.messages.fetch(
                        chat.message_id
                    ); // fetch message from discord by id
                    const content = generate_attack_message(attack, chat);
                    const update = await discord.edit(content);
                    const event = await db_updateEvent(chat);
                }
            });
        } else {
            chats.forEach(async (chat) => {
                const discord = await channel.messages.fetch(chat.message_id); // fetch message from discord by id

         Ongoing       const item = await fetchAttackEventById(chat.event_id).then(
                    (response) => response.data
                );

                if (!item) {
                    console.log('item not found', chat);
                    return;
                }

                const content = generate_attack_message(item, chat); // create message content
                const update = await discord.edit(content);
                const event = await db_updateEvent(item);
            });
        }
    } catch (error) {
        if (error.constructor.name === 'DiscordAPIError') {
            log.error(chalk.red('DiscordAPIError'));
            // if (error.message === 'Unknown Message') {
            //     const event = await db_setInactive(exists.event_id); // update the database record
            // }
        }
        log.error(chalk.red(error));
    }
}

module.exports = updateAttack;
