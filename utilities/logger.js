const pino = require('pino');
const pretty = require('pino-pretty');

let streamInstance;
function getStream() {
    // Create a singleton instance of Pino
    const pinoPrettyOptions = {
        colorize: true,
        translateTime: true,
        ignore: 'pid,hostname',
        messageKey: 'message',
        ignoreObject: true,
        // Pretty print the timestamp
        formatter: ({ level, message, timestamp }) => {
            return `${timestamp} [${level}]: ${message}`;
        },
    };

    if (!streamInstance) {
        streamInstance = pretty(pinoPrettyOptions);
    }

    return streamInstance;
}

let loggerInstance;
function getLogger() {
    // Create a singleton instance of Pino
    if (!loggerInstance) {
        loggerInstance = pino(getStream());
    }
    return loggerInstance;
}

module.exports = {
    getStream,
    getLogger,
};
