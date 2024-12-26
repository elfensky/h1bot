const prisma = require('../prisma.js');
// logs, monitoring, etc
const pino = require('pino');
const chalk = require('chalk');
// setup
const log = pino({
    transport: {
        target: 'pino-pretty',
    },
});

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

module.exports = db_getEventById;
