const { Router } = require('express');
const prisma = require('../prismaClient');
const { authenticate } = require('../middleware/authMiddleware');

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  const contacts = await prisma.contact.findMany({
    include: { company: true },
    orderBy: { id: 'asc' },
  });
  res.json(contacts);
});

router.post('/', async (req, res) => {
  const { name, email, phone, companyId } = req.body;
  try {
    const contact = await prisma.contact.create({
      data: { name, email, phone, companyId: parseInt(companyId) },
    });
    res.json(contact);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create contact' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, companyId } = req.body;
  try {
    const contact = await prisma.contact.update({
      where: { id: parseInt(id) },
      data: { name, email, phone, companyId: parseInt(companyId) },
    });
    res.json(contact);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update contact' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.contact.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete contact' });
  }
});

module.exports = router;
