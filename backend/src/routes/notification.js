const { Router } = require('express');
const prisma = require('../prismaClient');
const { authenticate } = require('../middleware/authMiddleware');

const router = Router();

router.use(authenticate);

// Get the current user's notifications (most recent first)
router.get('/', async (req, res) => {
  const userId = req.user.id;
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notifications);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch notifications' });
  }
});

// Unread count, handy for a badge
router.get('/unread-count', async (req, res) => {
  const userId = req.user.id;
  const count = await prisma.notification.count({ where: { userId, isRead: false } });
  res.json({ count });
});

// Mark a single notification as read (scoped to the logged-in user)
router.patch('/:id/read', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const result = await prisma.notification.updateMany({
      where: { id: parseInt(id), userId },
      data: { isRead: true },
    });
    res.json({ success: true, count: result.count });
  } catch (error) {
    res.status(400).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all as read
router.patch('/read-all', async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true, count: result.count });
  } catch (error) {
    res.status(400).json({ error: 'Failed to mark notifications as read' });
  }
});

module.exports = router;
