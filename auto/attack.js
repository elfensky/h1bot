const { performance } = require('perf_hooks');
const dotenv = require('dotenv');
const chalk = require('chalk');
const pino = require('pino');
//api
const getAttackEvent = require('../api/getAttackEvent');
//database
const {
    db_getEvent,
    db_getEventById,
    db_updateEvent,
    db_SaveEvent,
} = require('../prisma/functions/attackOperations');
// components
const { attackMessage } = require('../utilities/generateMessage');

//config
dotenv.config();
const log = pino({
    transport: {
        target: 'pino-pretty',
    },
});

async function updateAttack(channel) {
    const start = performance.now();

    let event = await db_getEvent(); //database - get the most recent event
    const api = await getAttackEvent().then((response) => response.data); //api - get most recent data
    const status = api.status === 'active' ? true : false;

    if (!event) {
        //if no event in database this is a fresh setup.
        //start discord.js
        const content = attackMessage(api); // create message content
        const message = await channel.send(content); // post message to discord (returns message object)
        //start prisma
        event = await db_SaveEvent(api.event_id, message.id); // save event with --linked messageId --- to database

        return {
            action: 'attack.js',
            message: ' - created initial event with with message_id ',
            variable: event.message_id,
            start,
        };
    }

    if (event.active === true && event.event_id === api.event_id) {
        //there is currently an active event ongoing, update the database record and discord message.
        //start prisma
        event = await db_updateEvent(event.event_id, status); // update the database record
        //start discord.js
        const content = attackMessage(api, event); // create message content
        const message = await channel.messages.fetch(event.message_id); // fetch message from discord by id
        const update = await message.edit(content); // update the message with new content

        return {
            action: 'attack.js',
            message: ' - updated eventmessage with message_id ',
            variable: event.message_id,
            start,
        };
    }

    if (event.active === true && event.event_id !== api.event_id) {
        // a new defend event has immediately started after the previous one:
        // update the old one to a loss
        event = await db_updateEvent(event.event_id, false); // update old event to inactive
        const old_message = await channel.messages.fetch(event.message_id); // fetch old message from discord
        const update = await old_message.edit('we have lost'); // update old message with loss

        // create a new defend event
        const content = attackMessage(api); // create message content
        const message = await channel.send(content); // post message to discord (returns message object)
        event = await db_SaveEvent(api.event_id, message.id); // save event with --linked messageId --- to database
        return {
            action: 'attack.js',
            message:
                ' - updated old event and created new event with message_id ',
            variable: event.message_id,
            start,
        };
    }

    return {
        action: 'attack.js',
        message: ' - event has concluded and the last update was sent on ',
        variable: event.message_updated.toLocaleString('de-GB'),
        start,
    };
}

module.exports = updateAttack;
