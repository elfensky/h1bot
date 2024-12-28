const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
//logging
const chalk = require('chalk'); //colorful terminal output
const pino = require('pino'); //low overhead nodejs logger
const log = pino({
    transport: {
        target: 'pino-pretty',
    },
});
async function runMigrations() {
    log.info('DATABASE - starting migrations...');
    try {
        const { stdout, stderr } = await execAsync(`npx prisma migrate deploy`);
        if (stderr) {
            throw new Error(stderr);
        }

        const cleanedStdout = stdout.replace(/(\r?\n){3,}/g, '\n');
        log.info('\n' + cleanedStdout);
        log.info('DATABASE - finished migrations');
        return true;
    } catch (error) {
        log.error('DATABASE - failed migrations \n' + error);
        throw error;
    }
}

module.exports = runMigrations;
