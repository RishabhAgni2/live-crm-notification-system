const { Router } = require('express');
const prisma = require('../prismaClient');
const { authenticate } = require('../middleware/authMiddleware');

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  const companies = await prisma.company.findMany({
    include: { contacts: true },
    orderBy: { id: 'asc' },
  });
  res.json(companies);
});

router.post('/', async (req, res) => {
  const { name, industry, address } = req.body;
  try {
    const company = await prisma.company.create({
      data: { name, industry, address },
    });
    res.json(company);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create company' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, industry, address } = req.body;
  try {
    const company = await prisma.company.update({
      where: { id: parseInt(id) },
      data: { name, industry, address },
    });
    res.json(company);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update company' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.company.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete company' });
  }
});

module.exports = router;
