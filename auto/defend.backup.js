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
    db_updateEvent,
    db_SaveEvent,
} = require('../prisma/functions/defendOperations');
// components
const { defendMessage } = require('../utilities/generateMessage');

//config
dotenv.config();
const log = pino({
    transport: {
        target: 'pino-pretty',
    },
});

async function updateDefend(channel) {
    const start = performance.now();

    let event = await db_getEvent(); //database - get the most recent event
    const api = await fetchDefendEvent().then((response) => response.data); //api - get most recent data

    try {
        if (!event) {
            console.log('@@@@@@ - 1');
            //if no event in database this is a fresh setup.
            //start discord.js
            const content = defendMessage(api); // create message content
            const message = await channel.send(content); // post message to discord (returns message object)
            //start prisma
            event = await db_SaveEvent(api.event_id, message.id); // save event with --linked messageId --- to database

            return {
                action: 'defend.js',
                message: ' - created initial event with with message_id ',
                variable: event.message_id,
                start,
            };
        }

        if (
            (api.status === 'active' || event.stauts === 'active') &&
            event.event_id === api.event_id
        ) {
            console.log('@@@@@@ - 2');
            //there is currently an active event ongoing, update the database record and discord message.
            //start prisma
            event = await db_updateEvent(event.event_id, api.status); // update the database record
            //start discord.js
            const content = defendMessage(api, event); // create message content
            const message = await channel.messages.fetch(event.message_id); // fetch message from discord by id
            const update = await message.edit(content); // update the message with new content
            // messa;
            return {
                action: 'defend.js',
                message: ' - updated eventmessage with message_id ',
                variable: event.message_id,
                start,
            };
        }

        if (event.event_id !== api.event_id) {
            console.log('@@@@@@ - 3');
            // OPTION1: a new defend event has immediately started after the previous one
            // OPTION2: bot has been offline for a while

            // create a new defend event
            const content = defendMessage(api); // create message content
            const message = await channel.send(content); // post message to discord (returns message object)
            event = await db_SaveEvent(api.event_id, message.id); // save event with --linked messageId --- to database
            return {
                action: 'defend.js',
                message:
                    ' - updated old event and created new event with message_id ',
                variable: event.message_id,
                start,
            };

            const old_api = await fetchDefendEventById(event.event_id).then(
                (response) => response.data
            ); //get all data from teh api about the old event
            const old_message = await channel.messages.fetch(event.message_id); // fetch old message from discord
            const old_content = defendMessage(old_api, event); // generate new message content based on it here.
            old_message.edit(old_content).then(() => {
                db_updateEvent(old_api.event_id, old_api.status); // update old event to inactive
            });
        }

        console.log('@@@@@@ - 4');
        return {
            action: 'defend.js',
            message: ' - event has concluded and the last update was sent on ',
            variable: event.message_updated.toLocaleString('de-GB'),
            start,
        };
    } catch (error) {
        if (error.constructor.name === 'DiscordAPIError') {
            if (error.message === 'Unknown Message') {
                console.log('@@@@@@ - 5');
                //message has been deleted, set event to inactive
                const old_api = await fetchDefendEventById(event.event_id).then(
                    (response) => response.data
                ); //get all data from teh api about the old event
                db_updateEvent(old_api.event_id, old_api.status);
            } else {
                // console.log(error);
            }
        }

        return {
            action: 'defend.js',
            message: ` ${error.constructor.name} | ${error.message} `,
            variable: error.cause,
            start,
        };
    }
}

module.exports = updateDefend;
