const { performance } = require('perf_hooks');
const dotenv = require('dotenv');
const chalk = require('chalk');
const pino = require('pino');
//api
const getEvent = require('../api/getEvent');
//database
const {
    db_getEvent,
    db_getEventById,
    db_updateEvent,
    db_SaveEvent,
} = require('../prisma/functions/eventOperations');
// components
const eventMessage = require('../utilities/eventMessage');

//config
dotenv.config();
const log = pino({
    transport: {
        target: 'pino-pretty',
    },
});

async function updateEvent(channel) {
    const start = performance.now();

    let event = await db_getEvent(); //database - get the most recent event
    const api = await getEvent().then((response) => response.data); //api - get most recent data
    const status = api.status === 'active' ? true : false;

    if (!event) {
        //if no event in database this is a fresh setup.
        //start discord.js
        const content = eventMessage(api); // create message content
        const message = await channel.send(content); // post message to discord (returns message object)
        //start prisma
        event = await db_SaveEvent(api.event_id, message.id); // save event with --linked messageId --- to database

        return {
            action: 'event.js',
            message: ' - created initial event with with message_id ',
            variable: event.message_id,
            start,
        };
    }

    if (event.active === true) {
        //if existing event is currently in-progress, update the discord message and database record
        //start prisma
        event = await db_updateEvent(event.event_id, status); // update the database record
        //start discord.js
        const content = eventMessage(api, event); // create message content
        const message = await channel.messages.fetch(event.message_id); // fetch message from discord by id
        const update = await message.edit(content); // update the message with new content

        return {
            action: 'event.js',
            message: ' - updated message with message_id ',
            variable: event.message_id,
            start,
        };
    }

    //if event has concluded, do not update message, but fetch API data to check if there is a new event ongoing
    if (event.event_id === api.event_id) {
        // if the currently available event matches the one stored in the database,
        // it means that the current event has concluded and there is nothing happening right now.
        return {
            action: 'event.js',
            message: ' - event has concluded and the last update was sent on ',
            variable: event.message_updated.toLocaleString('de-GB'),
            start,
        };
    }

    // if otherwise, it means a new event has started, and we must
    // 1. post a new message to discord (generate message.id)
    // 2. create a new event in the database
    const content = eventMessage(api); // create message content
    const message = await channel.send(content); // post message to discord (returns message object)
    event = await db_SaveEvent(api.event_id, message.id); // save event with --linked messageId --- to database
    return {
        action: 'event.js',
        message: ' - created new event with with message_id ',
        variable: event.message_id,
        start,
    };
}

module.exports = updateEvent;
