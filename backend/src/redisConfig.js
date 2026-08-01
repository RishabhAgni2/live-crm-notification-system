// Central place for the Redis connection string used by:
//  - Bull (job queue for the background process)
//  - a plain Redis pub/sub channel that lets the worker process (which has
//    no socket.io server of its own) tell the API process to push a live
//    notification to the correct connected user.
//
// Works with a local Redis (redis://127.0.0.1:6379) or a hosted Redis
// such as Upstash/Redis Cloud (rediss://default:password@host:port).

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const NOTIFICATION_PUBSUB_CHANNEL = 'live-notifications';

module.exports = { REDIS_URL, NOTIFICATION_PUBSUB_CHANNEL };
