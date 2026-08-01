const { Router } = require('express');
const prisma = require('../prismaClient');
const { authenticate } = require('../middleware/authMiddleware');

const router = Router();

router.use(authenticate);

// Get all users (used by admins to pick who to assign)
router.get('/', async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: { id: 'asc' },
  });
  res.json(users);
});

module.exports = router;
