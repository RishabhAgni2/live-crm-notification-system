require('dotenv').config();

// This file is the background process. Run it as its own process with
// `npm run start:worker` (or `node src/worker.js`), separately from the API
// server. It has no HTTP server and no socket.io instance of its own -
// instead, after it saves a notification to Postgres, it publishes a small
// message on Redis pub/sub so the API process (server.js) can push it live
// to the correct connected user.

const Redis = require('ioredis');
const prisma = require('./prismaClient');
const notificationQueue = require('./queues/notificationQueue');
const { REDIS_URL, NOTIFICATION_PUBSUB_CHANNEL } = require('./redisConfig');

const publisher = new Redis(REDIS_URL);

async function saveAndPublish(userId, message, source) {
  const notification = await prisma.notification.create({
    data: { userId, message, source },
  });

  await publisher.publish(
    NOTIFICATION_PUBSUB_CHANNEL,
    JSON.stringify({ userId, notification })
  );

  return notification;
}

// Job type 1: one-off follow-up reminder, enqueued from routes/assignment.js
// right after an admin assigns a company/contact to a user.
notificationQueue.process('follow-up-reminder', async (job) => {
  const { userId, entityName, assignmentRole, assignmentId } = job.data;
  const message = `Follow-up reminder: don't forget to check in on ${entityName} (you're the ${assignmentRole}).`;

  console.log(`[worker] processing follow-up-reminder for user ${userId} (assignment ${assignmentId})`);
  await saveAndPublish(userId, message, 'BACKGROUND_JOB');
});

// Job type 2: a recurring scheduled scan (Bull "repeatable" job), similar to
// a cron job, that looks for assignments made in the last few minutes with
// no recent activity and nudges the owner. This is the "scheduled job"
// style background flow described in the assignment.
notificationQueue.process('scan-recent-assignments', async () => {
  console.log('[worker] running scheduled scan for recent assignments...');

  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);

  const recentAssignments = await prisma.assignment.findMany({
    where: { createdAt: { gte: twoMinutesAgo, lte: oneMinuteAgo } },
    include: { user: true },
  });

  for (const assignment of recentAssignments) {
    const message = `Reminder: assignment #${assignment.id} (${assignment.assignmentRole}) may need your attention.`;
    await saveAndPublish(assignment.userId, message, 'BACKGROUND_JOB');
    console.log(`[worker] sent scheduled reminder to user ${assignment.userId}`);
  }
});

// Register the repeatable job once. Bull de-dupes identical repeat configs,
// so it's safe for this to run every time the worker boots.
async function scheduleRecurringJobs() {
  await notificationQueue.add(
    'scan-recent-assignments',
    {},
    { repeat: { cron: '* * * * *' }, removeOnComplete: true } // every minute
  );
  console.log('[worker] scheduled recurring "scan-recent-assignments" job (every minute)');
}

notificationQueue.on('completed', (job) => {
  console.log(`[worker] job ${job.id} (${job.name}) completed`);
});

notificationQueue.on('failed', (job, err) => {
  console.error(`[worker] job ${job.id} (${job.name}) failed:`, err.message);
});

scheduleRecurringJobs().catch((err) => {
  console.error('[worker] failed to schedule recurring job:', err);
});

console.log('Background worker started, waiting for jobs on the "notifications" queue...');
