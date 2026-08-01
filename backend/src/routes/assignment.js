const { Router } = require('express');
const prisma = require('../prismaClient');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');
const { emitNotificationToUser } = require('../socket');
const notificationQueue = require('../queues/notificationQueue');

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  const assignments = await prisma.assignment.findMany({
    include: { user: true },
    orderBy: { id: 'desc' },
  });
  res.json(assignments);
});

// Admin assigns a company/contact to a user -> instant notification +
// a delayed "follow-up reminder" job pushed onto the Bull queue.
router.post('/', requireAdmin, async (req, res) => {
  const { userId, entityType, entityId, assignmentRole } = req.body;

  if (!userId || !entityType || !entityId || !assignmentRole) {
    return res.status(400).json({ error: 'userId, entityType, entityId and assignmentRole are required' });
  }

  try {
    const assignment = await prisma.assignment.create({
      data: {
        userId: parseInt(userId),
        entityType,
        entityId: parseInt(entityId),
        assignmentRole,
      },
    });

    let entityName = 'a record';
    if (entityType === 'COMPANY') {
      const company = await prisma.company.findUnique({ where: { id: parseInt(entityId) } });
      entityName = company ? company.name : 'a Company';
    } else {
      const contact = await prisma.contact.findUnique({ where: { id: parseInt(entityId) } });
      entityName = contact ? contact.name : 'a Contact';
    }

    const message = `You have been assigned to ${entityName} as ${assignmentRole}.`;

    // 1) Save the notification immediately so it is never only "in memory"
    const notification = await prisma.notification.create({
      data: {
        userId: parseInt(userId),
        message,
        source: 'SYSTEM',
      },
    });

    // 2) Push it live, ONLY to that user's private socket room
    emitNotificationToUser(userId, notification);

    // 3) Enqueue a background job (processed by src/worker.js via Bull)
    //    that will create + push a follow-up reminder a bit later. This is
    //    the "background process" required by the assignment: it runs
    //    independently of this HTTP request/response cycle.
    await notificationQueue.add(
      'follow-up-reminder',
      {
        userId: parseInt(userId),
        entityName,
        assignmentRole,
        assignmentId: assignment.id,
      },
      { delay: 60 * 1000 } // fires 1 minute after the assignment is made
    );

    res.json({ assignment, notification });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create assignment' });
  }
});

module.exports = router;
