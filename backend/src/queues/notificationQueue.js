const Queue = require('bull');
const { REDIS_URL } = require('../redisConfig');

// One Bull queue used for every background-notification flow in the app.
// Producers (Express routes) call notificationQueue.add(...) to enqueue work.
// The consumer lives in src/worker.js and can run as a completely separate
// Node process (`npm run start:worker`) or alongside the API via `npm run dev`.
const notificationQueue = new Queue('notifications', REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});

module.exports = notificationQueue;
