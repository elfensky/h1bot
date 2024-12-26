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
        log.error(chalk.red('saveDefendEvent() crashed: \n') + error.message);
        throw error;
    }
}

module.exports = db_SaveEvent;
