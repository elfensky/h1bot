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

async function db_getEvent() {
    const start = performance.now();
    try {
        const event = await prisma.defend.findFirst({
            orderBy: {
                message_created: 'desc',
                // id: 'desc', //uuid@7 has a time component
            },
        });

        log.info(
            chalk.cyan('defendOperations.js') +
                chalk.white(' - ran db_getEvent() in ') +
                chalk.blue((performance.now() - start).toFixed(3) + ' ms')
        );

        return event;
    } catch (error) {
        log.error(chalk.red('db_getEvent() crashed: \n') + error.message);
        throw error;
    }
}

async function db_getEventById(id) {
    const start = performance.now();
    try {
        const event = await prisma.defend.findUnique({
            where: { event_id: id },
        });

        log.info(
            chalk.cyan('defendOperations.js') +
                chalk.white(' - ran db_getEventById(') +
                chalk.yellow(id) +
                chalk.white(') in ') +
                chalk.blue((performance.now() - start).toFixed(3) + ' ms')
        );

        return event;
    } catch (error) {
        log.error(chalk.red('db_getEventById() crashed: \n') + error.message);
        throw error;
    }
}

async function db_getAllActive() {
    const start = performance.now();
    try {
        const events = await prisma.defend.findMany({
            where: { active: true },
        });

        log.info(
            chalk.cyan('defendOperations.js') +
                chalk.white(' - ran db_getAllActive() in ') +
                chalk.blue((performance.now() - start).toFixed(3) + ' ms')
        );

        return events;
    } catch (error) {
        log.error(chalk.red('db_getAllActive() crashed: \n') + error.message);
        throw error;
    }
}

async function db_SaveEvent(event_id, message_id) {
    const start = performance.now();
    try {
        const now = new Date();

        // Ensure that the timestamp exists in the Timestamp table
        const event = await prisma.defend.create({
            data: {
                event_id: event_id,
                message_id: message_id,
                message_created: now,
                message_updated: now,
                // status: 'active', // default to active, because it's a new event
                // active: true, // default to active, because it's a new event
            },
        });

        log.info(
            chalk.cyan('defendOperations.js') +
                chalk.white(' - ran db_SaveEvent(') +
                chalk.yellow(`${event_id}, ${message_id}`) +
                chalk.white(') in ') +
                chalk.blue((performance.now() - start).toFixed(3) + ' ms')
        );

        return event;
    } catch (error) {
        log.error(chalk.red('db_SaveEvent() crashed: \n') + error.message);
        throw error;
    }
}

async function db_updateEvent(api) {
    const start = performance.now();
    try {
        const event = await prisma.defend.update({
            where: { event_id: api.event_id },
            data: {
                message_updated: new Date(),
                status: api.status,
                active: api.status === 'active' ? true : false,
            },
        });

        log.info(
            chalk.cyan('defendOperations.js') +
                chalk.white(' - ran db_updateEvent(') +
                chalk.yellow(event.event_id) +
                chalk.white(') in ') +
                chalk.blue((performance.now() - start).toFixed(3) + ' ms')
        );

        return event;
    } catch (error) {
        log.error(chalk.red('db_updateEvent() crashed: \n') + error.message);
        throw error;
    }
}

async function db_setInactive(event_id) {
    const start = performance.now();

    try {
        const event = await prisma.defend.update({
            where: { event_id: event_id },
            data: {
                message_updated: new Date(),
                status: 'deleted',
                active: false,
            },
        });

        log.info(
            chalk.cyan('defendOperations.js') +
                chalk.white(' - ran db_setInactive(') +
                chalk.yellow(event_id) +
                chalk.white(') in ') +
                chalk.blue((performance.now() - start).toFixed(3) + ' ms')
        );

        return event;
    } catch (error) {
        log.error(chalk.red('db_setInactive() crashed: \n') + error.message);
        throw error;
    }
}

async function db_upsertEvent(event_id, data) {
    const start = performance.now();
    try {
        const now = new Date();

        const event = await prisma.defend.upsert({
            where: { event_id: event_id },
            data: {
                message_updated: now,
                status: data.status,
                active: data.active,
            },
        });

        log.info(
            chalk.cyan('defendOperations.js') +
                chalk.white(' - ran db_upsertEvent(') +
                chalk.yellow(event_id) +
                chalk.white(') in ') +
                chalk.blue((performance.now() - start).toFixed(3) + ' ms')
        );

        return event;
    } catch (error) {
        log.error(chalk.red('db_upsertEvent() crashed: \n') + error.message);
        throw error;
    }
}

module.exports = {
    db_getEvent,
    db_getEventById,
    db_getAllActive,
    db_SaveEvent,
    db_updateEvent,
    db_setInactive,
};
