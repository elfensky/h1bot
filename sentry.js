const dotenv = require('dotenv');
const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

dotenv.config();

if (!process.env.SENTRY_DSN) {
    throw new Error('SENTRY_DSN is not set');
}

const release = 'helldivers1bot@' + process.env.npm_package_version;
const environment = process.env.NODE_ENV || 'development';

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [nodeProfilingIntegration()],
    release: release,
    environment: environment,
    // Add Tracing by setting tracesSampleRate
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    // Set sampling rate for profiling
    // This is relative to tracesSampleRate
    profilesSampleRate: 1.0,
});

console.log('[Sentry] initializing sentry for ' + release);

// Manually call startProfiler and stopProfiler
// to profile the code in between
// Sentry.profiler.startProfiler();

// // Starts a transaction that will also be profiled
// Sentry.startSpan(
//     {
//         name: 'My First Transaction',
//     },
//     () => {
//         // the code executing inside the transaction will be wrapped in a span and profiled
//     }
// );

// Calls to stopProfiling are optional - if you don't stop the profiler, it will keep profiling
// your application until the process exits or stopProfiling is called.
// Sentry.profiler.stopProfiler();
