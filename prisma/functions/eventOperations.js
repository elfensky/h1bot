const prisma = require('../prisma.js');
// logs, monitoring, etc
const chalk = require('chalk');
const pino = require('pino');
// setup
const log = pino({
    transport: {
        target: 'pino-pretty',
    },
});

async function db_SaveEvent(eventId, messageId) {
    const start = performance.now();
    try {
        const now = new Date();

        // Ensure that the timestamp exists in the Timestamp table
        const newEvent = await prisma.event.create({
            data: {
                event_id: eventId,
                message_id: messageId,
                last_updated: now,
                finished: false,
            },
        });

        log.info(
            chalk.white('DB - ran db_SaveEvent(') +
                chalk.yellow(`${eventId}, ${messageId}`) +
                chalk.white(') in ') +
                chalk.blue((performance.now() - start).toFixed(3) + ' ms')
        );

        return newEvent;
    } catch (error) {
        log.error(chalk.red('db_SaveEvent() crashed: \n') + error.message);
        throw error;
    }
}

async function db_updateEvent(id, active) {
    const start = performance.now();

    try {
        const now = new Date();

        const event = await prisma.event.update({
            where: { event_id: id },
            data: {
                last_updated: now,
                active: active,
            },
        });

        log.info(
            chalk.white('DB - ran updateEvent(') +
                chalk.yellow(id) +
                chalk.white(') in ') +
                chalk.blue((performance.now() - start).toFixed(3) + ' ms')
        );

        return event;
    } catch (error) {
        log.error(chalk.red('db_updateEvent() crashed: \n') + error.message);
        throw error;
    }
}

async function db_getEventById(id) {
    const start = performance.now();
    try {
        const event = await prisma.event.findUnique({
            where: { event_id: id },
        });

        log.info(
            chalk.white('DB - ran getEventById(') +
                chalk.yellow(id) +
                chalk.white(') in ') +
                chalk.blue((performance.now() - start).toFixed(3) + ' ms')
        );

        return event;
    } catch (error) {
        log.error(chalk.red('getEventById() crashed: \n') + error.message);
        throw error;
    }
}

module.exports = {
    db_SaveEvent,
    db_updateEvent,
    db_getEventById,
};
